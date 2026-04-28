import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SendLoginOTP, VerifyLoginOTP } from "../redux/userSlice";
import { message } from "antd";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Heading,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  PinInput,
  PinInputField,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineShieldCheck, HiOutlineArrowLeft, HiOutlineRefresh, HiOutlineClock, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
const EMAIL = process.env.REACT_APP_EMAIL;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1 = email+password, 2 = OTP
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [devOtp, setDevOtp] = useState(""); // For LOCAL mode
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const dispatch = useDispatch();
  const timerRef = useRef(null);
  const resendTimerRef = useRef(null);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation function
  const validatePassword = (password) => password.length >= 6;

  // Start resend cooldown timer
  const startResendCooldown = useCallback((seconds) => {
    setResendCooldown(seconds);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(resendTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // OTP expiry countdown timer
  const startTimer = useCallback(() => {
    setTimer(300); // 5 minutes = 300 seconds
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Step 1: Validate credentials & Send OTP
  const handleSendOTP = async () => {
    let emailError = "";
    let passwordError = "";
    if (!validateEmail(email)) {
      emailError = "Please enter a valid email.";
    }
    if (!validatePassword(password)) {
      passwordError = "Password must be at least 6 characters.";
    }
    setErrors({ email: emailError, password: passwordError });
    if (emailError || passwordError) return;

    setLoading(true);
    try {
      const res = await dispatch(SendLoginOTP({ email, password })).unwrap();
      if (res?.otp) {
        setDevOtp(res.otp);
      }
      message.success(res?.message || "OTP sent!");
      setStep(2);
      startTimer();
      // First send: 60s cooldown before allowing resend
      startResendCooldown(60);
      setResendCount(1);
    } catch (err) {
      message.error(err?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (otpValue) => {
    const otpToVerify = otpValue || otp;
    if (otpToVerify.length !== 6) {
      message.error("Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await dispatch(
        VerifyLoginOTP({ email, otp: otpToVerify })
      ).unwrap();
      if (res?.token) {
        localStorage.setItem("token", res.token);
        message.success("Logging in...");
        window.location.replace("/");
      } else {
        message.error(res?.message || "Verification failed");
      }
    } catch (err) {
      message.error(err?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || loading) return;
    setOtp("");
    setDevOtp("");
    setLoading(true);
    try {
      const res = await dispatch(SendLoginOTP({ email, password })).unwrap();
      if (res?.otp) {
        setDevOtp(res.otp);
      }
      message.success(res?.message || "OTP resent!");
      startTimer();
      // After first resend, use 2 minute cooldown
      const newCount = resendCount + 1;
      setResendCount(newCount);
      startResendCooldown(newCount >= 2 ? 120 : 60);
    } catch (err) {
      message.error(err?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Go back to email step
  const handleChangeEmail = () => {
    setStep(1);
    setOtp("");
    setDevOtp("");
    if (timerRef.current) clearInterval(timerRef.current);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    setTimer(0);
    setResendCooldown(0);
    setResendCount(0);
  };

  return (
    <Flex
      minH="100vh"
      direction={{ base: "column", md: "row" }}
      bg="brand.background"
    >
      {/* Left Side: Branding / Visual */}
      <Flex
        flex={1}
        bgGradient="linear(to-br, brand.primary, brand.secondary)"
        color="white"
        p={10}
        direction="column"
        justify="center"
        align="center"
        position="relative"
        overflow="hidden"
        display={{ base: "none", md: "flex" }}
      >
        {/* Glassmorphism Abstract Shapes */}
        <Box
          position="absolute"
          top="-10%"
          left="-10%"
          w="400px"
          h="400px"
          bg="whiteAlpha.200"
          borderRadius="full"
          filter="blur(50px)"
        />
        <Box
          position="absolute"
          bottom="-10%"
          right="-10%"
          w="300px"
          h="300px"
          bg="whiteAlpha.200"
          borderRadius="full"
          filter="blur(40px)"
        />

        <VStack spacing={8} zIndex={1} textAlign="center" maxW="lg">
          <Image
            src="/images/mainLogo.jpeg"
            alt="Main Logo"
            maxH="120px"
            objectFit="contain"
            bg="white"
            p={2}
            borderRadius="xl"
            boxShadow="2xl"
          />
          <Heading as="h1" size="2xl" fontWeight="bold" lineHeight="tall">
            Welcome to Teacher Portal
          </Heading>
          <Text fontSize="lg" opacity={0.9}>
            A comprehensive evaluation system to streamline academic and
            administrative assessments with precision.
          </Text>
        </VStack>
      </Flex>

      {/* Right Side: Form */}
      <Flex flex={1} justify="center" align="center" p={{ base: 6, md: 10 }}>
        <Box
          w="full"
          maxW="xl"
          bg="white"
          p={10}
          borderRadius="2xl"
          boxShadow={{ base: "none", md: "2xl" }}
          border={{ base: "none", md: "1px solid" }}
          borderColor="gray.100"
        >
          <VStack spacing={6} align="stretch" w="full">
            <Box
              textAlign="center"
              display={{ base: "block", md: "none" }}
              mb={4}
            >
              <Image
                src="/images/mainLogo.jpeg"
                alt="Main Logo"
                mx="auto"
                mb={4}
                maxH="80px"
                objectFit="contain"
              />
              <Heading as="h1" size="xl" color="brand.secondary" mb={2}>
                Teacher Portal
              </Heading>
            </Box>

            <Box mb={2}>
              <Heading
                as="h2"
                size="xl"
                mb={2}
                color="brand.text"
                fontWeight="bold"
              >
                {step === 1 ? "Login" : "Enter OTP"}
              </Heading>
              <Text color="brand.textMuted" fontSize="md">
                {step === 1
                  ? "Enter your credentials to receive a one-time password."
                  : `We've sent a 6-digit OTP to ${email}`}
              </Text>
            </Box>

            {/* ============ STEP 1: EMAIL ============ */}
            {step === 1 && (
              <>
                <Stack spacing={5}>
                  <FormControl isInvalid={!!errors.email}>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <HiOutlineMail
                          color="var(--chakra-colors-brand-secondary)"
                          size={18}
                        />
                      </InputLeftElement>
                      <Input
                        id="login-email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        focusBorderColor="brand.primary"
                        borderColor="gray.300"
                        _hover={{ borderColor: "brand.secondary" }}
                        borderRadius="lg"
                        bg="gray.50"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendOTP();
                        }}
                      />
                    </InputGroup>
                    {errors.email && (
                      <FormErrorMessage>{errors.email}</FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl isInvalid={!!errors.password}>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <HiOutlineLockClosed
                          color="var(--chakra-colors-brand-secondary)"
                          size={18}
                        />
                      </InputLeftElement>
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendOTP();
                        }}
                        focusBorderColor="brand.primary"
                        borderColor="gray.300"
                        _hover={{ borderColor: "brand.secondary" }}
                        borderRadius="lg"
                        bg="gray.50"
                      />
                      <InputRightElement h="full" pr={2}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <HiOutlineEye size={18} />
                          ) : (
                            <HiOutlineEyeOff size={18} />
                          )}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    {errors.password && (
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    )}
                  </FormControl>
                </Stack>

                <Flex justify="flex-end" align="center">
                  <Box
                    as={Link}
                    to={
                      email
                        ? `/forget-password?email=${encodeURIComponent(email)}`
                        : "/forget-password"
                    }
                    color="brand.primary"
                    fontWeight="semibold"
                    fontSize="sm"
                    _hover={{
                      color: "brand.secondary",
                      textDecoration: "underline",
                    }}
                    transition="color 0.2s"
                  >
                    Forgot Password?
                  </Box>
                </Flex>

                <Button
                  id="send-otp-btn"
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  leftIcon={<HiOutlineMail size={18} />}
                  onClick={handleSendOTP}
                  isLoading={loading}
                  loadingText="Sending OTP..."
                  py={7}
                  mt={2}
                  fontSize="md"
                  fontWeight="bold"
                  borderRadius="xl"
                  boxShadow="lg"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "xl",
                    bg: "brand.secondary",
                  }}
                  _active={{
                    transform: "translateY(0)",
                    boxShadow: "md",
                  }}
                  transition="all 0.3s"
                >
                  Send OTP
                </Button>
              </>
            )}

            {/* ============ STEP 2: OTP ============ */}
            {step === 2 && (
              <>
                {/* Dev Mode OTP Banner */}
                {devOtp && (
                  <Box
                    bg="yellow.50"
                    border="1px solid"
                    borderColor="yellow.300"
                    borderRadius="lg"
                    p={3}
                    textAlign="center"
                  >
                    <Text fontSize="xs" color="yellow.700" fontWeight="bold">
                      🔧 DEV MODE — Your OTP:
                    </Text>
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      color="yellow.800"
                      letterSpacing="0.5em"
                      fontFamily="monospace"
                    >
                      {devOtp}
                    </Text>
                  </Box>
                )}

                {/* Timer */}
                <Flex justify="center" align="center" gap={2}>
                  <HiOutlineClock
                    color={
                      timer <= 60
                        ? "var(--chakra-colors-red-500)"
                        : "var(--chakra-colors-brand-primary)"
                    }
                    size={16}
                  />
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={timer <= 60 ? "red.500" : "brand.primary"}
                    lineHeight="1"
                  >
                    {timer > 0
                      ? `OTP expires in ${formatTime(timer)}`
                      : "OTP has expired"}
                  </Text>
                </Flex>

                {/* OTP Input */}
                <Flex justify="center" py={4}>
                  <HStack spacing={3}>
                    <PinInput
                      size="lg"
                      otp
                      value={otp}
                      onChange={(value) => setOtp(value)}
                      onComplete={(value) => handleVerifyOTP(value)}
                      focusBorderColor="brand.primary"
                      autoFocus
                    >
                      <PinInputField
                        borderColor="gray.300"
                        _hover={{ borderColor: "brand.secondary" }}
                        _focus={{
                          borderColor: "brand.primary",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)",
                        }}
                        bg="gray.50"
                        borderRadius="lg"
                        w="52px"
                        h="52px"
                        fontSize="xl"
                        fontWeight="bold"
                        textAlign="center"
                      />
                      <PinInputField
                        borderColor="gray.300"
                        _hover={{ borderColor: "brand.secondary" }}
                        _focus={{
                          borderColor: "brand.primary",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)",
                        }}
                        bg="gray.50"
                        borderRadius="lg"
                        w="52px"
                        h="52px"
                        fontSize="xl"
                        fontWeight="bold"
                        textAlign="center"
                      />
                      <PinInputField
                        borderColor="gray.300"
                        _hover={{ borderColor: "brand.secondary" }}
                        _focus={{
                          borderColor: "brand.primary",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)",
                        }}
                        bg="gray.50"
                        borderRadius="lg"
                        w="52px"
                        h="52px"
                        fontSize="xl"
                        fontWeight="bold"
                        textAlign="center"
                      />
                      <PinInputField
                        borderColor="gray.300"
                        _hover={{ borderColor: "brand.secondary" }}
                        _focus={{
                          borderColor: "brand.primary",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)",
                        }}
                        bg="gray.50"
                        borderRadius="lg"
                        w="52px"
                        h="52px"
                        fontSize="xl"
                        fontWeight="bold"
                        textAlign="center"
                      />
                      <PinInputField
                        borderColor="gray.300"
                        _hover={{ borderColor: "brand.secondary" }}
                        _focus={{
                          borderColor: "brand.primary",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)",
                        }}
                        bg="gray.50"
                        borderRadius="lg"
                        w="52px"
                        h="52px"
                        fontSize="xl"
                        fontWeight="bold"
                        textAlign="center"
                      />
                      <PinInputField
                        borderColor="gray.300"
                        _hover={{ borderColor: "brand.secondary" }}
                        _focus={{
                          borderColor: "brand.primary",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-primary)",
                        }}
                        bg="gray.50"
                        borderRadius="lg"
                        w="52px"
                        h="52px"
                        fontSize="xl"
                        fontWeight="bold"
                        textAlign="center"
                      />
                    </PinInput>
                  </HStack>
                </Flex>

                {/* Verify Button */}
                <Button
                  id="verify-otp-btn"
                  colorScheme="brand"
                  size="lg"
                  w="full"
                  leftIcon={<HiOutlineShieldCheck size={18} />}
                  onClick={() => handleVerifyOTP()}
                  isLoading={loading}
                  loadingText="Verifying..."
                  isDisabled={otp.length !== 6 || timer === 0}
                  py={7}
                  fontSize="md"
                  fontWeight="bold"
                  borderRadius="xl"
                  boxShadow="lg"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "xl",
                    bg: "brand.secondary",
                  }}
                  _active={{
                    transform: "translateY(0)",
                    boxShadow: "md",
                  }}
                  transition="all 0.3s"
                >
                  Verify & Login
                </Button>

                {/* Resend & Change Email */}
                <Flex justify="space-between" align="center" mt={1}>
                  <Box
                    as="button"
                    onClick={handleChangeEmail}
                    color="brand.primary"
                    fontWeight="semibold"
                    fontSize="sm"
                    display="inline-flex"
                    alignItems="center"
                    gap="6px"
                    _hover={{
                      color: "brand.secondary",
                      textDecoration: "underline",
                    }}
                    transition="color 0.2s"
                  >
                    <HiOutlineArrowLeft size={14} /> Change Email
                  </Box>
                  <Box
                    as="button"
                    onClick={handleResendOTP}
                    color={resendCooldown > 0 ? "gray.400" : "brand.primary"}
                    fontWeight="semibold"
                    fontSize="sm"
                    display="inline-flex"
                    alignItems="center"
                    gap="6px"
                    opacity={loading || resendCooldown > 0 ? 0.5 : 1}
                    cursor={loading || resendCooldown > 0 ? "not-allowed" : "pointer"}
                    _hover={{
                      color: resendCooldown > 0 ? "gray.400" : "brand.secondary",
                      textDecoration: resendCooldown > 0 ? "none" : "underline",
                    }}
                    transition="color 0.2s"
                    disabled={loading || resendCooldown > 0}
                  >
                    <HiOutlineRefresh size={14} />{" "}
                    {resendCooldown > 0
                      ? `Resend in ${formatTime(resendCooldown)}`
                      : "Resend OTP"}
                  </Box>
                </Flex>
              </>
            )}

            <Text>
              If you're facing any issue, please email{" "}
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
}

export default Login;
