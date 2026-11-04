const Form1 = require('../models/Form1');
const Form2 = require('../models/Form2');
const Form3 = require('../models/Form3');
const Weekly4Form = require('../models/Weekly4Form');
const CoScholastic = require('../models/CoScholastic');
const User = require('../models/User');

const computeDomainAverage = (forms, domainKey) => {
    let totalScore = 0;
    let totalMax = 0;

    forms.forEach(form => {
        const items = form[domainKey];
        if (Array.isArray(items)) {
            items.forEach(item => {
                const ans = parseFloat(item?.answer);
                if (!isNaN(ans) && ans > 0) {
                    totalScore += ans;
                    totalMax += 4; // 4-point rubric
                }
            });
        }
    });

    return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
};

exports.getExecutiveAnalytics = async (req, res) => {
    try {
        const { timeframe = 'session' } = req.query;
        const now = new Date();
        let queryFilter = {};
        let timeframeLabel = "Entire Session";
        let dateRange = { start: null, end: now };

        if (timeframe === '7days') {
            const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            queryFilter = { createdAt: { $gte: start, $lte: now } };
            timeframeLabel = "Last 7 Days";
            dateRange = { start, end: now };
        } else if (timeframe === '15days') {
            const start = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
            queryFilter = { createdAt: { $gte: start, $lte: now } };
            timeframeLabel = "Last 15 Days";
            dateRange = { start, end: now };
        } else if (timeframe === '30days') {
            const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            queryFilter = { createdAt: { $gte: start, $lte: now } };
            timeframeLabel = "Last 30 Days";
            dateRange = { start, end: now };
        } else if (timeframe === '1year') {
            const start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            queryFilter = { createdAt: { $gte: start, $lte: now } };
            timeframeLabel = "Last Year (Past 365 Days)";
            dateRange = { start, end: now };
        } else if (timeframe === 'all') {
            // Old time / All time: unconstrained historical search
            queryFilter = {};
            timeframeLabel = "All Time (Historical)";
            dateRange = { start: null, end: now };
        } else {
            // Default: 'session' (Entire Academic Session)
            if (req.sessionDateFilter) {
                queryFilter = { createdAt: req.sessionDateFilter };
                timeframeLabel = req.activeSession ? `Academic Session ${req.activeSession}` : "Entire Academic Session";
                dateRange = { start: req.sessionDateFilter.$gte, end: req.sessionDateFilter.$lt };
            } else {
                const year = now.getFullYear();
                const month = now.getMonth() + 1;
                const startYear = month >= 4 ? year : year - 1;
                const start = new Date(`${startYear}-04-01T00:00:00.000Z`);
                const end = new Date(`${startYear + 1}-04-01T00:00:00.000Z`);
                queryFilter = { createdAt: { $gte: start, $lt: end } };
                timeframeLabel = `Academic Session ${startYear}-${startYear + 1}`;
                dateRange = { start, end };
            }
        }

        // Fetch completed walkthroughs and co-scholastic observations
        const [walkthroughs, coScholastics, totalTeachers, totalObservers] = await Promise.all([
            Form2.find({ isDraft: { $ne: true }, ...queryFilter })
                .populate('grenralDetails.NameoftheVisitingTeacher', 'name email employeeId')
                .populate('createdBy', 'name email')
                .lean(),
            CoScholastic.find({ isDraft: { $ne: true }, ...queryFilter })
                .populate('grenralDetails.NameoftheVisitingTeacher', 'name email employeeId')
                .populate('createdBy', 'name email')
                .lean(),
            User.countDocuments({ access: 'Teacher', isActive: { $ne: false } }),
            User.countDocuments({ access: 'Observer', isActive: { $ne: false } }),
        ]);

        const allEvaluations = [...walkthroughs, ...coScholastics];

        // Grade Distribution
        const gradeDistribution = { "A+": 0, "A": 0, "B": 0, "C": 0, "D": 0 };
        let totalPctSum = 0;
        let ratedCount = 0;

        allEvaluations.forEach(ev => {
            const pct = parseFloat(ev.percentageScore);
            if (!isNaN(pct)) {
                totalPctSum += pct;
                ratedCount++;
                if (pct >= 90) gradeDistribution["A+"]++;
                else if (pct >= 80) gradeDistribution["A"]++;
                else if (pct >= 70) gradeDistribution["B"]++;
                else if (pct >= 60) gradeDistribution["C"]++;
                else gradeDistribution["D"]++;
            }
        });

        const overallAverageScore = ratedCount > 0 ? Math.round(totalPctSum / ratedCount) : 0;

        // Pedagogical Domains (Rubric breakdown)
        const domainPerformance = [
            {
                name: "Classroom Environment & Management",
                score: Math.round(
                    (computeDomainAverage(walkthroughs, 'classRoomEnvironment') +
                        computeDomainAverage(coScholastics, 'classroomManagement')) / 2
                ) || (allEvaluations.length > 0 ? 0 : 85),
                benchmark: 80,
            },
            {
                name: "Planning, Preparation & Execution",
                score: Math.round(
                    (computeDomainAverage(walkthroughs, 'planingAndPreparation') +
                        computeDomainAverage(coScholastics, 'planningAndExecution')) / 2
                ) || (allEvaluations.length > 0 ? 0 : 82),
                benchmark: 75,
            },
            {
                name: "Student Engagement & Inclusivity",
                score: computeDomainAverage(coScholastics, 'studentEngagement') || (allEvaluations.length > 0 ? 0 : 88),
                benchmark: 80,
            },
            {
                name: "Instruction & Facilitation",
                score: Math.round(
                    (computeDomainAverage(walkthroughs, 'instruction') +
                        computeDomainAverage(coScholastics, 'instructionAndFacilitation')) / 2
                ) || (allEvaluations.length > 0 ? 0 : 84),
                benchmark: 78,
            },
            {
                name: "Essential Agreements & Time Discipline",
                score: computeDomainAverage(walkthroughs, 'essentialAggrements') || (allEvaluations.length > 0 ? 0 : 90),
                benchmark: 85,
            },
        ];

        // Velocity trends: Day-by-day for short timeframes (7d, 15d), Month-by-month for longer
        const trendData = [];
        if (timeframe === '7days' || timeframe === '15days') {
            const numDays = timeframe === '7days' ? 7 : 15;
            for (let i = numDays - 1; i >= 0; i--) {
                const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
                const dayStr = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const count = allEvaluations.filter(ev => {
                    const evDate = new Date(ev.createdAt || ev.grenralDetails?.DateOfObservation);
                    return (
                        evDate.getFullYear() === targetDate.getFullYear() &&
                        evDate.getMonth() === targetDate.getMonth() &&
                        evDate.getDate() === targetDate.getDate()
                    );
                }).length;
                trendData.push({ month: dayStr, evaluations: count });
            }
        } else {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const mYear = d.getFullYear();
                const mMonth = d.getMonth();

                const count = allEvaluations.filter(ev => {
                    const date = new Date(ev.createdAt || ev.grenralDetails?.DateOfObservation);
                    return date.getFullYear() === mYear && date.getMonth() === mMonth;
                }).length;

                trendData.push({
                    month: `${monthNames[mMonth]} ${mYear.toString().slice(-2)}`,
                    evaluations: count,
                });
            }
        }

        // Recent high-impact observations
        const recentHighlights = allEvaluations
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 8)
            .map(ev => ({
                id: ev._id,
                teacherName: ev.grenralDetails?.NameoftheVisitingTeacher?.name || "Teacher",
                observerName: ev.createdBy?.name || "Observer",
                subject: ev.grenralDetails?.Subject || "General",
                grade: ev.Grade || "A",
                percentage: parseFloat(ev.percentageScore) || 0,
                date: ev.grenralDetails?.DateOfObservation || ev.createdAt,
                formType: ev.classroomManagement ? "Co-Scholastic" : "Classroom Walkthrough",
            }));

        res.status(200).json({
            success: true,
            timeframe,
            timeframeLabel,
            dateRange,
            totalEvaluations: allEvaluations.length,
            overallAverageScore,
            totalTeachers,
            totalObservers,
            gradeDistribution,
            domainPerformance,
            monthlyTrends: trendData,
            recentHighlights,
        });
    } catch (err) {
        console.error("Error in getExecutiveAnalytics:", err);
        res.status(500).json({ success: false, message: "Failed to generate executive analytics" });
    }
};

exports.getTeacherPortfolio = async (req, res) => {
    try {
        const { teacherId: queryTeacherId, timeframe = 'session' } = req.query;
        const teacherId = queryTeacherId || req.user.id;
        const now = new Date();
        let queryFilter = {};

        if (timeframe === '7days') {
            const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            queryFilter = { createdAt: { $gte: start, $lte: now } };
        } else if (timeframe === '15days') {
            const start = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
            queryFilter = { createdAt: { $gte: start, $lte: now } };
        } else if (timeframe === '30days') {
            const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            queryFilter = { createdAt: { $gte: start, $lte: now } };
        } else if (timeframe === '1year') {
            const start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            queryFilter = { createdAt: { $gte: start, $lte: now } };
        } else if (timeframe === 'all') {
            queryFilter = {};
        } else {
            if (req.sessionDateFilter) {
                queryFilter = { createdAt: req.sessionDateFilter };
            }
        }

        const teacher = await User.findById(teacherId).select('name email employeeId customId access').lean();
        if (!teacher) {
            return res.status(404).json({ success: false, message: "Teacher not found" });
        }

        const teacherMatch = {
            $or: [
                { teacherID: teacherId },
                { 'grenralDetails.NameoftheVisitingTeacher': teacherId },
            ],
            isDraft: { $ne: true },
            ...queryFilter,
        };

        const [walkthroughs, coScholastics, fortnightlyForms, notebookForms] = await Promise.all([
            Form2.find(teacherMatch).populate('createdBy', 'name email').lean(),
            CoScholastic.find(teacherMatch).populate('createdBy', 'name email').lean(),
            Form1.find({
                $or: [{ teacherID: teacherId }, { userId: teacherId }],
                ...queryFilter,
            }).lean(),
            Form3.find({
                $or: [{ teacherID: teacherId }, { createdBy: teacherId }],
                ...queryFilter,
            }).lean(),
        ]);

        const scoredEvaluations = [...walkthroughs, ...coScholastics]
            .sort((a, b) => new Date(a.createdAt || a.grenralDetails?.DateOfObservation) - new Date(b.createdAt || b.grenralDetails?.DateOfObservation));

        // Score trajectory
        const trajectory = scoredEvaluations.map(ev => ({
            id: ev._id,
            date: ev.grenralDetails?.DateOfObservation || ev.createdAt,
            percentageScore: parseFloat(ev.percentageScore) || 0,
            grade: ev.Grade || "A",
            type: ev.classroomManagement ? "Co-Scholastic" : "Walkthrough",
            observer: ev.createdBy?.name || "Observer",
            subject: ev.grenralDetails?.Subject || "Subject",
            topic: ev.grenralDetails?.Topic || "",
        }));

        // Feedback Synthesis: Commendations vs Focus Areas
        const commendations = [];
        const focusAreas = [];

        scoredEvaluations.forEach(ev => {
            if (Array.isArray(ev.ObserverFeedback)) {
                ev.ObserverFeedback.forEach(f => {
                    const q = (f.question || "").toLowerCase();
                    const a = (f.answer || "").trim();
                    if (a && a.length > 3) {
                        if (q.includes("well") || q.includes("strength") || q.includes("positive")) {
                            commendations.push({ text: a, date: ev.createdAt, observer: ev.createdBy?.name });
                        } else if (q.includes("work") || q.includes("improve") || q.includes("focus") || q.includes("area")) {
                            focusAreas.push({ text: a, date: ev.createdAt, observer: ev.createdBy?.name });
                        }
                    }
                });
            }
        });

        // Overall stats
        const totalEvaluations = scoredEvaluations.length;
        const avgScore = totalEvaluations > 0
            ? Math.round(scoredEvaluations.reduce((sum, e) => sum + (parseFloat(e.percentageScore) || 0), 0) / totalEvaluations)
            : 0;

        res.status(200).json({
            success: true,
            teacher,
            summary: {
                totalEvaluations,
                averageScore: avgScore,
                fortnightlyCount: fortnightlyForms.length,
                notebookCount: notebookForms.length,
                commendationsCount: commendations.length,
                focusAreasCount: focusAreas.length,
            },
            trajectory,
            commendations: commendations.slice(0, 10),
            focusAreas: focusAreas.slice(0, 10),
        });
    } catch (err) {
        console.error("Error in getTeacherPortfolio:", err);
        res.status(500).json({ success: false, message: "Failed to generate teacher portfolio" });
    }
};
