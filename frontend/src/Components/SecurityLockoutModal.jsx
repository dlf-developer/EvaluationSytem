import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  Box,
  Heading,
} from '@chakra-ui/react';
import { axiosInstanceToken } from '../redux/instence';
import { clearTokens, getToken } from '../Utils/auth';

/**
 * SecurityLockoutModal
 * 1. Listens for 'account-deactivated' events dispatched by the security interceptor.
 * 2. Cross-tab synchronization via storage event listener.
 * 3. 45-second heartbeat + window focus listener to detect admin deactivations even when user is idle.
 */
export default function SecurityLockoutModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(
    'Your account has been deactivated by the administrator. All active sessions have been terminated.'
  );

  useEffect(() => {
    // ── 1. Listen for Deactivation Event dispatched by Axios Interceptor ───────
    const handleDeactivated = (e) => {
      clearTokens();
      if (e.detail?.message) {
        setMessage(e.detail.message);
      }
      setIsOpen(true);
    };
    window.addEventListener('account-deactivated', handleDeactivated);

    // ── 2. Cross-Tab Synchronization via Storage Events ────────────────────────
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue && !window.location.pathname.includes('/login')) {
        // Token was cleared in another tab (logout or deactivation)
        window.location.replace('/login');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // ── 3. Heartbeat & Window Focus Validator ──────────────────────────────────
    const checkUserStatus = async () => {
      const token = getToken();
      if (!token || window.location.pathname.includes('/login')) return;

      try {
        await axiosInstanceToken.get('/auth/validate-session');
      } catch (err) {
        // If inactive or invalid, interceptor will catch and dispatch 'account-deactivated'
      }
    };

    // Heartbeat every 45 seconds
    const interval = setInterval(checkUserStatus, 45000);

    // Window focus / tab switch check
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkUserStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('account-deactivated', handleDeactivated);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleGoToLogin = () => {
    clearTokens();
    window.location.replace('/login');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Non-dismissible
      closeOnOverlayClick={false}
      closeOnEsc={false}
      isCentered
      size="md"
    >
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" zIndex={9999} />
      <ModalContent
        zIndex={10000}
        rounded="2xl"
        p={4}
        textAlign="center"
        border="1px solid"
        borderColor="red.200"
        shadow="2xl"
      >
        <ModalHeader pb={0}>
          <VStack spacing={3}>
            <Box
              w="56px"
              h="56px"
              rounded="full"
              bg="red.100"
              color="red.600"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="28px"
            >
              ⚠️
            </Box>
            <Heading size="md" color="gray.800">
              Account Deactivated
            </Heading>
          </VStack>
        </ModalHeader>

        <ModalBody py={4}>
          <Text fontSize="14px" color="gray.600" lineHeight="1.6">
            {message}
          </Text>
          <Text fontSize="12px" color="gray.400" mt={3}>
            Please connect with your school administrator if you believe this is an error.
          </Text>
        </ModalBody>

        <ModalFooter justifyContent="center" pt={0}>
          <Button
            colorScheme="red"
            size="md"
            px={8}
            rounded="xl"
            onClick={handleGoToLogin}
            _hover={{ bg: 'red.600' }}
          >
            Return to Login
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

