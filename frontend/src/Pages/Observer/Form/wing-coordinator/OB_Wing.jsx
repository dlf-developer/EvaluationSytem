import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Checkbox, Spin, message, Input } from 'antd';
import Fillter_Wing from './Fillter_Wing';
import { getAllTimes } from '../../../../Utils/auth';
import { GetSingleWingFrom, updateWingForm, WingPublished } from '../../../../redux/userSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { inputsWing } from './wing';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Badge,
  Tag,
  Divider,
  Spinner,
  VStack,
  HStack,
  Grid,
  GridItem,
  Icon,
  Progress,
} from '@chakra-ui/react';
import { CheckCircleOutlined, FileTextOutlined, SaveOutlined, SendOutlined, ArrowRightOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const FORM_TITLES = [
  { key: 'form1', label: 'Fortnightly Monitor',           color: 'green'  },
  { key: 'form2', label: 'Classroom Walkthrough',         color: 'blue'   },
  { key: 'form3', label: 'Notebook Checking Proforma',    color: 'purple' },
  { key: 'form4', label: 'Learning Progress Checklist',   color: 'orange' },
];

// ── Score helpers ─────────────────────────────────────────────────────────────
const getTotalScore = (items, type, formType) => {
  if (formType === 'form1') {
    if (!items) return 0;
    const valid = ['Yes', 'Sometimes', 'No'];
    return Object.values(items[type] || {}).reduce((s, v) => s + (valid.includes(v) ? 1 : 0), 0);
  }
  if (formType === 'form2') {
    const sections = ['essentialAggrements', 'planingAndPreparation', 'classRoomEnvironment', 'instruction'];
    let out = 0;
    sections.forEach(sec => (items[sec] || []).forEach(item => { if (['1','2','3','4'].includes(item?.answer)) out += 4; }));
    return out;
  }
  if (formType === 'form3') {
    const keys = ['maintenanceOfNotebooks','qualityOfOppurtunities','qualityOfTeacherFeedback','qualityOfLearner'];
    const data = items[type];
    let out = 0;
    keys.forEach(k => (data?.[k] || []).forEach(item => { if (['1','2','3'].includes(item?.answer)) out += 3; }));
    return out;
  }
  return 0;
};

const getSelfScore = (items, type, formType) => {
  if (formType === 'form1') {
    if (!items) return 0;
    const vals = { Yes: 1, Sometimes: 0.5 };
    return Object.values(items[type] || {}).reduce((s, v) => s + (vals[v] || 0), 0);
  }
  if (formType === 'form2') {
    const sections = ['essentialAggrements', 'planingAndPreparation', 'classRoomEnvironment', 'instruction'];
    let total = 0;
    sections.forEach(sec => (items[sec] || []).forEach(item => { if (['1','2','3','4'].includes(item?.answer)) total += parseInt(item.answer, 10); }));
    return total;
  }
  if (formType === 'form3') {
    const keys = ['maintenanceOfNotebooks','qualityOfOppurtunities','qualityOfTeacherFeedback','qualityOfLearner'];
    const data = items[type];
    let total = 0;
    keys.forEach(k => (data?.[k] || []).forEach(item => { if (['1','2','3'].includes(item?.answer)) total += parseInt(item.answer, 10); }));
    return total;
  }
  return 0;
};

const pct = (score, total) => total > 0 ? ((score / total) * 100).toFixed(1) : null;

// ── Score Badge ───────────────────────────────────────────────────────────────
const ScorePill = ({ label, value }) => (
  value ? (
    <HStack spacing={1}>
      <Text fontSize="xs" color="gray.500">{label}:</Text>
      <Badge
        px={2} py={0.5}
        borderRadius="full"
        bg="brand.primary"
        color="white"
        fontSize="xs"
        fontWeight="600"
      >
        {value}%
      </Badge>
    </HStack>
  ) : null
);

// ── Step Indicator ─────────────────────────────────────────────────────────────
const StepIndicator = ({ current }) => (
  <Flex align="center" gap={3} mb={8}>
    {[
      { n: 1, label: 'Form Selection' },
      { n: 2, label: 'Monthly Report' },
      { n: 3, label: 'Review & Publish' },
    ].map(({ n, label }, i) => {
      const done   = current > n;
      const active = current === n;
      return (
        <React.Fragment key={n}>
          <Flex align="center" gap={2}>
            <Flex
              w={8} h={8}
              borderRadius="full"
              align="center" justify="center"
              fontWeight="700" fontSize="sm"
              bg={done ? 'brand.primary' : active ? 'brand.primary' : 'gray.200'}
              color={done || active ? 'white' : 'gray.500'}
              transition="all 0.2s"
            >
              {done ? <CheckCircleOutlined /> : n}
            </Flex>
            <Text
              fontSize="sm"
              fontWeight={active ? '600' : '400'}
              color={active ? 'brand.text' : 'gray.500'}
            >
              {label}
            </Text>
          </Flex>
          {i < 2 && (
            <Box flex={1} h="2px" bg={current > n ? 'brand.primary' : 'gray.200'} borderRadius="full" transition="background 0.3s" />
          )}
        </React.Fragment>
      );
    })}
  </Flex>
);

// ─────────────────────────────────────────────────────────────────────────────
function OB_Wing() {
  const { getFilteredDataList, loading } = useSelector(s => s?.user);
  const [formData, setFormData]   = useState();
  const [currForm, setCurrForm]   = useState();
  const [currStep, setCurrStep]   = useState(1);
  const [saving, setSaving]       = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [form] = Form.useForm();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const id        = useParams()?.id;
  const DRAFT_KEY = `wing-coordinator-draft-${id}`;

  const [selectedItems, setSelectedItems] = useState({ form1:[], form2:[], form3:[], form4:[] });

  // ── Load existing form ──
  useEffect(() => {
    const load = async () => {
      const res = await dispatch(GetSingleWingFrom(id));
      if (res?.payload?.success) {
        if (res.payload.data?.isComplete && !res.payload.data?.isDraft) {
          navigate('/wing-coordinator');
        } else {
          setCurrForm(res.payload.data);
        }
      } else {
        message.error('Could not load form. Please try again.');
      }
    };
    load();
  }, [dispatch, id]);

  useEffect(() => {
    if (currForm) {
      // 1. Restore server data first
      form.setFieldsValue(currForm);
      setSelectedItems({
        form1: currForm?.form1 || [],
        form2: currForm?.form2 || [],
        form3: currForm?.form3 || [],
        form4: currForm?.form4 || [],
      });
      // 2. If localStorage has a more-recent draft, overlay the monthlyReport
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw);
          if (draft?.monthlyReport?.length) {
            form.setFieldsValue({ monthlyReport: draft.monthlyReport });
            message.info({ content: '📋 Draft restored from your last session.', key: 'draft-restore', duration: 3 });
          }
        }
      } catch (_) {}
    }
  }, [currForm]);

  // ── Auto-save to localStorage on blur (focus-out) ──────────────────────────
  const handleInputBlur = () => {
    try {
      const { monthlyReport } = form.getFieldsValue();
      if (monthlyReport) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ monthlyReport }));
      }
    } catch (_) {}
  };

  const handleSelect = (checked, item, type) => {
    setSelectedItems(prev => ({
      ...prev,
      [type]: checked
        ? [...prev[type], item]
        : prev[type].filter(i => i._id !== item._id),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const values   = form.getFieldsValue();
      const { className, range } = formData || {};
      const { form1, form2, form3, form4 } = selectedItems;
      const checkdata = { ...values, className, range, form1, form2, form3, form4 };
      const res = await dispatch(updateWingForm({ id, checkdata })).unwrap();
      if (res?.success) message.success('Saved successfully');
      else message.error('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const { className, range } = formData || {};
      const { form1, form2, form3, form4 } = selectedItems;
      const { monthlyReport } = form.getFieldsValue();
      const checkdata = { className, range, form1, form2, form3, form4, isDraft: false, isComplete: true, monthlyReport };
      const res = await dispatch(WingPublished({ id, checkdata })).unwrap();
      if (res?.success) {
        // Clear the localStorage draft on successful publish
        try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
        message.success('Form published successfully!');
        navigate('/wing-coordinator');
      }
    } finally {
      setPublishing(false);
    }
  };

  // ── Monthly Report Section ──────────────────────────────────────────────────
  const renderMonthlyReport = () => (
    <Box>
      <Box mb={6}>
        <Heading size="md" color="brand.text" mb={1}>Monthly Report</Heading>
        <Text fontSize="sm" color="gray.500">
          Fill in each activity for this wing's monthly summary.
        </Text>
      </Box>
      <VStack spacing={4} align="stretch">
        {inputsWing.map((question, index) => (
          <Box
            key={index}
            bg="white"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="gray.100"
            p={5}
            boxShadow="sm"
            _hover={{ boxShadow: 'md', borderColor: 'brand.mid' }}
            transition="all 0.15s"
          >
            <Flex align="flex-start" gap={4}>
              <Flex
                minW={8} h={8}
                borderRadius="lg"
                bg="brand.background"
                color="brand.primary"
                align="center" justify="center"
                fontSize="13px"
                fontWeight="700"
                flexShrink={0}
              >
                {index + 1}
              </Flex>
              <Box flex={1}>
                <Text fontSize="sm" fontWeight="500" color="brand.text" mb={3} textTransform="capitalize">
                  {question}
                </Text>
                {/* Hidden question field */}
                <Form.Item
                  name={['monthlyReport', index, 'question']}
                  initialValue={question}
                  hidden
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name={['monthlyReport', index, 'answer']}
                  rules={[{ required: true, message: 'Please enter a response' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Input
                    placeholder="Enter your response…"
                    onBlur={handleInputBlur}
                    style={{
                      borderRadius: 8,
                      borderColor: '#E2E8F0',
                      fontSize: 14,
                      padding: '8px 12px',
                    }}
                  />
                </Form.Item>
                <Form.Item
                  name={['monthlyReport', index, 'remarks']}
                  rules={[{ required: true, message: 'Please enter remarks' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input.TextArea
                    placeholder="Enter remarks…"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    onBlur={handleInputBlur}
                    style={{
                      borderRadius: 8,
                      borderColor: '#E2E8F0',
                      fontSize: 14,
                      padding: '8px 12px',
                    }}
                  />
                </Form.Item>
              </Box>
            </Flex>
          </Box>
        ))}
      </VStack>
    </Box>
  );

  // ── Form Selection Section ──────────────────────────────────────────────────
  const renderFormCard = (item, type) => {
    const isChecked = selectedItems[type]?.some(i => i._id === item._id);
    const teacherName =
      type === 'form1' ? item?.teacherID?.name || item?.userId?.name :
      type === 'form2' ? item?.grenralDetails?.NameoftheVisitingTeacher?.name || item?.createdBy?.name :
      type === 'form3' ? item?.teacherID?.name || item?.createdBy?.name :
                         item?.teacherId?.name || item?.userId?.name;

    const teacherPct =
      type === 'form1' ? pct(getSelfScore(item, 'teacherForm', 'form1'), getTotalScore(item, 'teacherForm', 'form1')) :
      type === 'form2' ? pct(getSelfScore(item, 'teacherForm', 'form2'), getTotalScore(item, 'teacherForm', 'form2')) :
      type === 'form3' ? pct(getSelfScore(item, 'TeacherForm', 'form3'), getTotalScore(item, 'TeacherForm', 'form3')) :
      null;

    const observerPct =
      type === 'form1' ? pct(getSelfScore(item, 'observerForm', 'form1'), getTotalScore(item, 'observerForm', 'form1')) :
      type === 'form3' ? pct(getSelfScore(item, 'ObserverForm', 'form3'), getTotalScore(item, 'ObserverForm', 'form3')) :
      null;

    return (
      <Box
        key={item?._id}
        bg={isChecked ? 'brand.background' : 'white'}
        borderRadius="xl"
        borderWidth="2px"
        borderColor={isChecked ? 'brand.primary' : 'gray.100'}
        p={4}
        cursor="pointer"
        onClick={() => handleSelect(!isChecked, item, type)}
        transition="all 0.15s"
        _hover={{ borderColor: 'brand.mid', boxShadow: 'sm' }}
        boxShadow={isChecked ? 'sm' : 'none'}
      >
        <Flex align="flex-start" gap={3}>
          <Box pt="2px">
            <Checkbox
              checked={isChecked}
              onChange={e => { e.stopPropagation(); handleSelect(e.target.checked, item, type); }}
              style={{ accentColor: '#4A6741' }}
            />
          </Box>
          <Box flex={1}>
            <Flex justify="space-between" align="flex-start" wrap="wrap" gap={2}>
              <Box>
                <Text fontSize="sm" fontWeight="600" color="brand.text">{teacherName || '—'}</Text>
                <HStack spacing={3} mt={1}>
                  <Text fontSize="xs" color="gray.500">
                    {item?.className || item?.grenralDetails?.className || '—'}
                  </Text>
                  <Text fontSize="xs" color="gray.400">·</Text>
                  <Text fontSize="xs" color="gray.500">{getAllTimes(item?.createdAt)?.formattedDate2}</Text>
                </HStack>
              </Box>
              <HStack spacing={2} flexWrap="wrap">
                {teacherPct && <ScorePill label="Teacher" value={teacherPct} />}
                {observerPct && <ScorePill label="Observer" value={observerPct} />}
                {type === 'form2' && !teacherPct && (
                  <Text fontSize="xs" color="gray.400" fontStyle="italic">No scores yet</Text>
                )}
              </HStack>
            </Flex>
          </Box>
        </Flex>
      </Box>
    );
  };

  const renderFormSelection = () => (
    <Box>
      <Box mb={6}>
        <Heading size="md" color="brand.text" mb={1}>Form Selection</Heading>
        <Text fontSize="sm" color="gray.500">
          Search for forms by date range and class, then select the ones to include.
        </Text>
      </Box>

      {/* Filter card */}
      <Box
        bg="white"
        borderRadius="xl"
        borderWidth="1px"
        borderColor="gray.100"
        p={5}
        mb={6}
        boxShadow="sm"
      >
        <Text fontSize="sm" fontWeight="600" color="brand.text" mb={4}>Search Filters</Text>
        <Fillter_Wing saveData={setFormData} data={currForm} />
      </Box>

      {/* Form type sections */}
      {getFilteredDataList ? (
        <VStack spacing={6} align="stretch">
          {(formData?.formTypes?.length > 0
            ? FORM_TITLES.filter(f => formData.formTypes.includes(f.key))
            : FORM_TITLES
          ).map(({ key, label, color }) => {
            const items = getFilteredDataList?.[key] || [];
            const completed = items.filter(item =>
              (item?.isCoordinatorComplete && item?.isTeacherComplete) ||
              (item?.isObserverCompleted && item?.isTeacherCompletes) ||
              (item?.isTeacherComplete && item?.isObserverComplete) ||
              item?.isCompleted
            );
            const selected = selectedItems[key]?.length || 0;

            return (
              <Box key={key}>
                <Flex align="center" justify="space-between" mb={3}>
                  <HStack spacing={2}>
                    <Box w={2} h={5} borderRadius="full" bg={`${color}.400`} />
                    <Heading size="sm" color="brand.text">{label}</Heading>
                    <Badge colorScheme={color} variant="subtle" fontSize="xs">
                      {completed.length} available
                    </Badge>
                  </HStack>
                  {selected > 0 && (
                    <Badge bg="brand.primary" color="white" borderRadius="full" px={2} fontSize="xs">
                      {selected} selected
                    </Badge>
                  )}
                </Flex>

                {completed.length > 0 ? (
                  <VStack spacing={2} align="stretch">
                    {completed.map(item => renderFormCard(item, key))}
                  </VStack>
                ) : (
                  <Box
                    bg="gray.50"
                    borderRadius="lg"
                    p={4}
                    textAlign="center"
                    borderWidth="1px"
                    borderColor="gray.100"
                    borderStyle="dashed"
                  >
                    <Text fontSize="sm" color="gray.400">
                      No completed forms found for the selected filter.
                    </Text>
                  </Box>
                )}
              </Box>
            );
          })}
        </VStack>
      ) : (
        <Box
          bg="gray.50"
          borderRadius="xl"
          p={10}
          textAlign="center"
          borderWidth="1px"
          borderColor="gray.100"
          borderStyle="dashed"
        >
          <FileTextOutlined style={{ fontSize: 32, color: '#CBD5E0', marginBottom: 12 }} />
          <Text color="gray.400" fontSize="sm">
            Apply a date range and class filter above to load available forms.
          </Text>
        </Box>
      )}
    </Box>
  );

  // ── Review & Publish Section ────────────────────────────────────────────────
  const renderReview = () => (
    <Box>
      <Box mb={6}>
        <Heading size="md" color="brand.text" mb={1}>Review & Publish</Heading>
        <Text fontSize="sm" color="gray.500">
          Review your selections and monthly report before publishing.
        </Text>
      </Box>
      <VStack spacing={5} align="stretch">
        {/* Selected forms summary */}
        {FORM_TITLES.map(({ key, label, color }) => {
          const count = selectedItems[key]?.length || 0;
          return (
            <Box
              key={key}
              bg="white"
              borderRadius="xl"
              borderWidth="1px"
              borderColor={count > 0 ? 'brand.primary' : 'gray.100'}
              p={4}
              boxShadow="sm"
            >
              <Flex justify="space-between" align="center">
                <HStack spacing={2}>
                  <Box w={2} h={5} borderRadius="full" bg={`${color}.400`} />
                  <Text fontWeight="600" fontSize="sm" color="brand.text">{label}</Text>
                </HStack>
                <Badge
                  colorScheme={count > 0 ? 'green' : 'gray'}
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="xs"
                >
                  {count} selected
                </Badge>
              </Flex>
            </Box>
          );
        })}
        {/* Monthly report summary */}
        <Box
          bg="brand.background"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="brand.mid"
          p={5}
          boxShadow="sm"
        >
          <Text fontWeight="600" fontSize="sm" color="brand.text" mb={3}>Monthly Report</Text>
          <VStack spacing={2} align="stretch">
            {(form.getFieldValue('monthlyReport') || []).map((item, i) => (
              item?.question ? (
                <Box key={i}>
                  <Text fontSize="xs" color="gray.500" fontWeight="500">{item.question}</Text>
                  <Text fontSize="sm" color="brand.text" mb={item.remarks ? 1 : 0}>{item.answer || <Text as="span" color="gray.400" fontStyle="italic">No answer</Text>}</Text>
                  {item.remarks && (
                    <Text fontSize="xs" color="gray.600" bg="gray.50" p={2} borderRadius="md" mt={1}>
                      <Text as="span" fontWeight="600" mr={1}>Remarks:</Text>{item.remarks}
                    </Text>
                  )}
                </Box>
              ) : null
            ))}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );

  return (
    <Box p={{ base: 4, md: 8 }} minH="calc(100vh - 72px)">
      {/* ── Page Header ── */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Heading size="lg" color="brand.text" mb={1}>Wing Coordinator Analysis</Heading>
          <Text color="gray.500" fontSize="sm">
            Complete the monthly report, then link the relevant forms.
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<SaveOutlined />}
            borderColor="brand.primary"
            color="brand.primary"
            _hover={{ bg: 'brand.background' }}
            isLoading={saving}
            onClick={handleSave}
          >
            Save Draft
          </Button>
        </HStack>
      </Flex>

      {/* ── Progress bar ── */}
      <Progress
        value={currStep === 1 ? 33 : currStep === 2 ? 66 : 100}
        size="xs"
        colorScheme="green"
        borderRadius="full"
        mb={6}
        bg="gray.100"
      />

      {/* ── Step Indicator ── */}
      <StepIndicator current={currStep} />

      {/* ── Loading overlay ── */}
      {loading && (
        <Flex justify="center" align="center" py={12}>
          <Spinner size="xl" color="brand.primary" thickness="3px" />
        </Flex>
      )}

      {/* ── Main Content Card ── */}
      <Box
        bg="white"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="gray.100"
        boxShadow="sm"
        p={{ base: 5, md: 8 }}
        display={loading ? 'none' : 'block'}
      >
        <Form form={form} layout="vertical">
          {currStep === 1 && renderFormSelection()}
          {currStep === 2 && renderMonthlyReport()}
          {currStep === 3 && renderReview()}
        </Form>
      </Box>

      {/* ── Action Footer ── */}
      <Flex
        justify="space-between"
        align="center"
        mt={6}
        pt={4}
        borderTopWidth="1px"
        borderColor="gray.100"
        display={loading ? 'none' : 'flex'}
      >
          <Button
            variant="ghost"
            size="md"
            color="gray.500"
            _hover={{ color: 'brand.text', bg: 'gray.50' }}
            onClick={() => navigate('/wing-coordinator')}
          >
            ← Back to List
          </Button>

          <HStack spacing={3}>
            {/* Previous button */}
            {currStep > 1 && (
              <Button
                variant="outline"
                size="md"
                borderColor="gray.200"
                color="gray.600"
                _hover={{ bg: 'gray.50' }}
                leftIcon={<ArrowLeftOutlined />}
                onClick={() => setCurrStep(s => s - 1)}
              >
                Previous
              </Button>
            )}

            {/* Step 1 → 2 */}
            {currStep === 1 && (
              <Button
                size="md"
                bg="brand.primary"
                color="white"
                _hover={{ bg: 'brand.secondary', transform: 'translateY(-1px)' }}
                rightIcon={<ArrowRightOutlined />}
                onClick={() => setCurrStep(2)}
                transition="all 0.15s"
              >
                Next: Monthly Report
              </Button>
            )}

            {/* Step 2 → 3 */}
            {currStep === 2 && (
              <Button
                size="md"
                bg="brand.primary"
                color="white"
                _hover={{ bg: 'brand.secondary', transform: 'translateY(-1px)' }}
                rightIcon={<ArrowRightOutlined />}
                onClick={() => {
                  form.validateFields([['monthlyReport']])
                    .then(() => setCurrStep(3))
                    .catch(() => {});
                }}
                transition="all 0.15s"
              >
                Next: Review & Publish
              </Button>
            )}

            {/* Step 3 — Publish */}
            {currStep === 3 && (
              <Button
                size="md"
                bg="brand.primary"
                color="white"
                _hover={{ bg: 'brand.secondary', transform: 'translateY(-1px)' }}
                rightIcon={<SendOutlined />}
                isLoading={publishing}
                loadingText="Publishing…"
                onClick={handlePublish}
                transition="all 0.15s"
              >
                Publish Form
              </Button>
            )}
          </HStack>
        </Flex>
    </Box>
  );
}

export default OB_Wing;
