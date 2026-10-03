import { useEffect, useRef, useState } from "react";

// OTP-input mechanics (digit array, change/keydown/paste, autofocus, resend
// countdown), UI-agnostic so every OTP screen shares it.
export function useOtpInput({ length = 6, resendSeconds = 30 } = {}) {
  const [otp, setOtp] = useState(() => Array(length).fill(""));
  const [timer, setTimer] = useState(resendSeconds);
  const inputRefs = useRef([]);

  // Autofocus the first box on mount.
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend countdown.
  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const setChar = (index, char) =>
    setOtp((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });

  const handleChange = (e, index) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (!digits) {
      setChar(index, "");
      return;
    }
    setChar(index, digits.slice(-1));
    if (index < length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!digits) return;
    const next = Array(length).fill("");
    for (let i = 0; i < digits.length; i++) next[i] = digits[i];
    setOtp(next);
    inputRefs.current[Math.min(digits.length, length - 1)]?.focus();
  };

  const reset = () => {
    setOtp(Array(length).fill(""));
    setTimer(resendSeconds);
    inputRefs.current[0]?.focus();
  };

  const getInputProps = (index) => ({
    ref: (el) => (inputRefs.current[index] = el),
    value: otp[index] || "",
    onChange: (e) => handleChange(e, index),
    onKeyDown: (e) => handleKeyDown(e, index),
    onPaste: handlePaste,
    onFocus: (e) => e.target.select(),
    inputMode: "numeric",
    maxLength: 1,
    "aria-label": `Digit ${index + 1}`,
  });

  const value = otp.join("");

  return {
    length,
    value,
    isComplete: value.length === length,
    timer,
    reset,
    getInputProps,
  };
}
