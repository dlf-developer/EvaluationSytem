import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import React from 'react';
import Logo from '../Imgs/Logo.png';
import LogoBanner from '../Imgs/image.png';
import { getAllTimes } from '../../../Utils/auth';

function NoteBookDoc({ data }) {

    const Question = {
        maintenanceOfNotebooks: [
            "I have checked that NBs are in a good physical condition.",
            "I have checked that the work presentation is neat.",
            "I have ensured that the work of the learners is complete.",
            "I have checked the appropriateness of Headings / CW / HW.",
            "There is no scribbling on the last page/any pages thereof.",
            "I have ensured that the child has implemented the previous feedback and done the correction work."
        ],
        qualityOfOppurtunities: [
            "I have provided HOTs and VBQs with every chapter.",
            "I have made app. remarks about the quality of answers.",
            "I have developed vocab of students (pre-post activities).",
            "I have taken up at least 2 CSPs fortnightly with clear LOs.",
            "The quality questions given by me offer a scope for original thinking by learners.",
            "The writing tasks/questions given by me provide a scope for independent encounters."
        ],
        qualityOfTeacherFeedback: [
            "I have provided timely and regular feedback.",
            "I have corrected all the notebook work.",
            "I have provided positive reinforcement.",
            "I have provided personalized feedback.",
            "My feedback provides learners directions for improvement.",
            "My feedback facilitates learners with clear directions on what good work looks like."
        ],
        qualityOfLearner: [
            "I have checked/addressed the common misconceptions.",
            "I have given remarks if the answers are copied or if there are common errors."
        ]
    };

    const calculateScore = (formName) => {
        let totalScore = 0, outOfScore = 0, numOfParametersNA = 0;
        const keys = ["maintenanceOfNotebooks", "qualityOfOppurtunities", "qualityOfTeacherFeedback", "qualityOfLearner"];
        keys.forEach((section) => {
            if (formName?.[section]) {
                formName[section].forEach((item) => {
                    const ans = item?.answer;
                    if (["1", "2", "3"].includes(ans)) {
                        totalScore += parseInt(ans, 10);
                        outOfScore += 3;
                    }
                    if (["N/A", "NA", "N"].includes(ans)) numOfParametersNA++;
                });
            }
        });
        const percentage = outOfScore > 0 ? ((totalScore / outOfScore) * 100).toFixed(2) : 0;
        const grade = percentage >= 90 ? "A" : percentage >= 80 ? "B" : percentage >= 70 ? "C" : percentage >= 60 ? "D" : "F";
        return { totalScore, outOfScore, percentage, grade, numOfParametersNA };
    };

    const observerScore = calculateScore(data?.ObserverForm);
    const teacherScore = calculateScore(data?.TeacherForm);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.container}>
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <Image src={Logo} style={styles.logo} />
                        <Image src={LogoBanner} style={styles.logoBanner} />
                    </View>

                    {/* Section One */}
                    <View style={styles.sectionRow}>
                        {[
                            { label: "NAME OF OBSERVER", value: data?.grenralDetails?.NameofObserver?.name || data?.createdBy?.name },
                            { label: "CLASS & SECTION", value: `${data?.grenralDetails?.className} / ${data?.grenralDetails?.Section}` },
                            { label: "SUBJECT", value: data?.grenralDetails?.Subject },
                            { label: "DATE", value: getAllTimes(data?.grenralDetails?.DateOfObservation).formattedDate2 }
                        ].map((item, index) => (
                            <View key={index} style={styles.columnSection}>
                                <Text style={styles.cellHeader}>{item.label}</Text>
                                <Text style={styles.cellAnswer}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={[styles.sectionRow, { borderTopWidth: 0 }]}>
                        {[
                            { label: "ABSENTEES", value: data?.NotebooksObserver?.Absentees || "0" },
                            { label: "CLASS STRENGTH", value: data?.NotebooksObserver?.ClassStrength || "0" },
                            { label: "DEFAULTERS", value: data?.NotebooksObserver?.Defaulters || "0" },
                            { label: "SUBMITTED", value: data?.NotebooksObserver?.NotebooksSubmitted || "0" }
                        ].map((item, index) => (
                            <View key={index} style={styles.columnSection}>
                                <Text style={styles.cellHeader}>{item.label}</Text>
                                <Text style={styles.cellAnswer}>{item.value}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Observation Sections */}
                    {[
                        { title: "MAINTENANCE OF NOTEBOOKS", key: "maintenanceOfNotebooks" },
                        { title: "QUALITY OF OPPORTUNITIES GIVEN TO STUDENTS", key: "qualityOfOppurtunities" },
                        { title: "QUALITY OF TEACHER FEEDBACK", key: "qualityOfTeacherFeedback" },
                        { title: "QUALITY OF LEARNERS' RESPONSES / PERFORMANCE", key: "qualityOfLearner" }
                    ].map((section, idx) => (
                        <View key={idx} style={styles.observationSection}>
                            <Text style={styles?.subTitle}>{section?.title}</Text>
                            <View style={styles?.observationTable}>
                                {Question[section?.key]?.map((item, index) => (
                                    <View key={index} style={styles.observationRow}>
                                        <Text
                                            style={[
                                                styles.parameter,
                                                {
                                                    borderBottomWidth: index === Question[section?.key]?.length - 1 ? 0 : 1,
                                                    borderRightWidth: 1,
                                                },
                                            ]}
                                        >
                                            {item}
                                        </Text>
                                        <Text style={[styles.remarks, {
                                            borderBottomWidth: index === Question[section?.key]?.length - 1 ? 0 : 1,
                                            borderRightWidth: 1,
                                        },]}>
                                            {data?.ObserverForm?.[section?.key]?.[index]?.answer || "N/A"}
                                        </Text>
                                        <Text style={[styles.remarks, {
                                            borderBottomWidth: index === Question[section?.key]?.length - 1 ? 0 : 1,
                                        },]}>
                                            {data?.ObserverForm?.[section?.key]?.[index]?.remark || "N/A"}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.container}>


                <View style={styles.headerSection}>
                        <Image src={Logo} style={styles.logo} />
                        <Image src={LogoBanner} style={styles.logoBanner} />
                    </View>

                    {/* Section One */}
                    <View style={styles.sectionRow}>
                        {[
                            { label: "NAME OF THE TEACHER", value: data?.teacherID?.name || data?.createdBy?.name },
                            { label: "CLASS & SECTION", value: `${data?.grenralDetails?.className} / ${data?.grenralDetails?.Section}` },
                            { label: "SUBJECT", value: data?.grenralDetails?.Subject },
                            { label: "DATE", value: getAllTimes(data?.grenralDetails?.DateOfObservation).formattedDate2 }
                        ].map((item, index) => (
                            <View key={index} style={styles.columnSection}>
                                <Text style={styles.cellHeader}>{item.label}</Text>
                                <Text style={styles.cellAnswer}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                    <View style={[styles.sectionRow, { borderTopWidth: 0 }]}>
                        {[
                            { label: "ABSENTEES", value: data?.NotebooksTeacher?.Absentees || "0" },
                            { label: "CLASS STRENGTH", value: data?.NotebooksTeacher?.ClassStrength || "0" },
                            { label: "DEFAULTERS", value: data?.NotebooksTeacher?.Defaulters || "0" },
                            { label: "SUBMITTED", value: data?.NotebooksTeacher?.NotebooksSubmitted || "0" }
                        ].map((item, index) => (
                            <View key={index} style={styles.columnSection}>
                                <Text style={styles.cellHeader}>{item.label}</Text>
                                <Text style={styles.cellAnswer}>{item.value}</Text>
                            </View>
                        ))}
                    </View>

                        {/* Observation Sections */}
                    {[
                        { title: "MAINTENANCE OF NOTEBOOKS", key: "maintenanceOfNotebooks" },
                        { title: "QUALITY OF OPPORTUNITIES GIVEN TO STUDENTS", key: "qualityOfOppurtunities" },
                        { title: "QUALITY OF TEACHER FEEDBACK", key: "qualityOfTeacherFeedback" },
                        { title: "QUALITY OF LEARNERS' RESPONSES / PERFORMANCE", key: "qualityOfLearner" }
                    ].map((section, idx) => (
                        <View key={idx} style={styles.observationSection}>
                            <Text style={styles?.subTitle}>{section?.title}</Text>
                            <View style={styles?.observationTable}>
                                {Question[section?.key]?.map((item, index) => (
                                    <View key={index} style={styles.observationRow}>
                                        <Text
                                            style={[
                                                styles.parameter,
                                                {
                                                    borderBottomWidth: index === Question[section?.key]?.length - 1 ? 0 : 1,
                                                    borderRightWidth: 1,
                                                },
                                            ]}
                                        >
                                            {item}
                                        </Text>
                                        <Text style={[styles.remarks, {
                                            borderBottomWidth: index === Question[section?.key]?.length - 1 ? 0 : 1,
                                            borderRightWidth: 1,
                                        },]}>
                                            {data?.TeacherForm?.[section?.key]?.[index]?.answer || "N/A"}
                                        </Text>
                                        <Text style={[styles.remarks, {
                                            borderBottomWidth: index === Question[section?.key]?.length - 1 ? 0 : 1,
                                        },]}>
                                            {data?.TeacherForm?.[section?.key]?.[index]?.remark || "N/A"}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>
            </Page>

            <Page size="A4" style={styles.page}>
                <View style={styles.container}>
                    {/* Comments Section */}
                    <View style={styles.observationSection}>
                        <Text style={styles.subTitle}>OBSERVER'S COMMENTS</Text>
                        <View style={{ borderWidth: 1, padding: 10, minHeight: 60, borderColor: '#000' }}>
                            <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
                                {data?.observerFeedback || "No feedback provided."}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.observationSection}>
                        <Text style={styles.subTitle}>TEACHER'S REFLECTION / COMMENTS</Text>
                        <View style={{ borderWidth: 1, padding: 10, minHeight: 60, borderColor: '#000' }}>
                            <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
                                {data?.teacherReflationFeedback || "No reflection provided."}
                            </Text>
                        </View>
                    </View>

                    {/* Total Tables Section */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 }}>
                        {/* Teacher Score */}
                        <View style={{ width: '48%', borderWidth: 1, borderColor: '#000', borderRadius: 4 }}>
                            <View style={{ padding: 5, backgroundColor: '#f0fdf4', borderBottomWidth: 1, borderColor: '#000' }}>
                                <Text style={[styles.subTitle, { marginBottom: 0, textAlign: 'center', color: '#166534' }]}>TEACHER SELF-ASSESSMENT SCORE</Text>
                            </View>
                            <View style={{ padding: 10 }}>
                                <Text style={[styles.parameter, { width: '100%', marginBottom: 6, fontSize: 11 }]}>Total Score:      <Text style={{fontWeight: 'bold', color: '#166534'}}>{teacherScore.totalScore} / {teacherScore.outOfScore}</Text></Text>
                                <Text style={[styles.parameter, { width: '100%', marginBottom: 6, fontSize: 11 }]}>Percentage:    <Text style={{fontWeight: 'bold', color: '#166534'}}>{teacherScore.percentage}%</Text></Text>
                                <Text style={[styles.parameter, { width: '100%', marginBottom: 6, fontSize: 11 }]}>Grade:              <Text style={{fontWeight: 'bold', color: '#166534'}}>{teacherScore.grade}</Text></Text>
                                <Text style={[styles.parameter, { width: '100%', marginBottom: 6, fontSize: 11 }]}>N/A:                   <Text style={{fontWeight: 'bold', color: '#166534'}}>{teacherScore.numOfParametersNA}</Text></Text>
                            </View>
                        </View>

                        {/* Observer Score */}
                        <View style={{ width: '48%', borderWidth: 1, borderColor: '#000', borderRadius: 4 }}>
                            <View style={{ padding: 5, backgroundColor: '#eff6ff', borderBottomWidth: 1, borderColor: '#000' }}>
                                <Text style={[styles.subTitle, { marginBottom: 0, textAlign: 'center', color: '#1e3a8a' }]}>OBSERVER EVALUATION SCORE</Text>
                            </View>
                            <View style={{ padding: 10 }}>
                                <Text style={[styles.parameter, { width: '100%', marginBottom: 6, fontSize: 11 }]}>Total Score:      <Text style={{fontWeight: 'bold', color: '#1e3a8a'}}>{observerScore.totalScore} / {observerScore.outOfScore}</Text></Text>
                                <Text style={[styles.parameter, { width: '100%', marginBottom: 6, fontSize: 11 }]}>Percentage:    <Text style={{fontWeight: 'bold', color: '#1e3a8a'}}>{observerScore.percentage}%</Text></Text>
                                <Text style={[styles.parameter, { width: '100%', marginBottom: 6, fontSize: 11 }]}>Grade:              <Text style={{fontWeight: 'bold', color: '#1e3a8a'}}>{observerScore.grade}</Text></Text>
                                <Text style={[styles.parameter, { width: '100%', marginBottom: 6, fontSize: 11 }]}>N/A:                   <Text style={{fontWeight: 'bold', color: '#1e3a8a'}}>{observerScore.numOfParametersNA}</Text></Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>

        </Document>
    );
}

export default NoteBookDoc;

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#fff',
    },
    container: {
        margin: 20,
        padding: 20,
    },
    headerSection: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    logo: {
        width: 100,
        height: 100,
    },
    logoBanner: {
        width: 300,
        height: 80,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    titleText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    columnSection: {
        width: '25%',
        borderWidth: 1,
        borderColor: '#000',
    },
    cellHeader: {
        padding: 5,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        borderBottomWidth: 1,
        borderColor: '#000',
    },
    cellAnswer: {
        padding: 5,
        fontSize: 10,
        textAlign: 'center',
    },
    observationSection: {
        marginTop: 20,
    },
    subTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    observationTable: {
        borderWidth: 1,
    },
    observationRow: {
        flexDirection: 'row',
        padding: 0,
    },
    parameter: {
        width: '50%',
        fontSize: 10,
        padding: 5,
        borderColor: '#000',
    },
    remarks: {
        width: '25%',
        fontSize: 10,
        padding: 5,
        borderColor: '#000',
        textAlign: 'center',
    },
    footerSection: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});