import ChatBubble from "@mui/icons-material/ChatBubble";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutlined";
import ChevronRight from "@mui/icons-material/ChevronRight";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

const _agreements = [
  {
    id: "terms",
    label: "[필수] 이용약관 및 개인정보 수집 동의",
    required: true,
  },
  { id: "age", label: "[필수] 만 14세 이상입니다", required: true },
  { id: "news", label: "[선택] 여행 소식 받기", required: false },
];

const socialProviders = [
  { id: "google", label: "구글" },
  { id: "naver", label: "네이버" },
  { id: "kakao", label: "카카오" },
];

const fieldSx = {
  height: 50,
  borderRadius: "14px",
  color: "text.primary",
  fontSize: 14,
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "divider",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "divider",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "primary.main",
  },
  "& input": {
    px: 1.75,
    py: 1.5,
  },
  "& input::placeholder": {
    color: "text.primary",
    opacity: 1,
  },
};

export const Content = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [agreements, setAgreements] = useState({
    terms: true,
    age: true,
    news: false,
  });

  const toggleAgreement = (id) => {
    setAgreements((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: 734,
        px: 3,
        pt: 2,
        pb: 3,
        mx: "auto",
        maxWidth: 400,
        boxSizing: "border-box",
      }}
    >
      <Stack component="form" spacing={2.25} onSubmit={handleSubmit}>
        <Stack component="header" spacing={0.625}>
          <Typography
            component="h1"
            sx={{
              color: "grey.900",
              fontSize: 22,
              fontWeight: 700,
              lineHeight: "33px",
            }}
          >
            여백과 시작해요
          </Typography>
          <Typography
            sx={{
              color: "grey.500",
              fontSize: 12,
              lineHeight: "18px",
            }}
          >
            여행과 대화를 나만의 수첩에.
          </Typography>
        </Stack>
        <Stack spacing={1.5}>
          <Stack spacing={0.75}>
            <Typography
              component="label"
              htmlFor="name"
              sx={{
                color: "grey.700",
                fontSize: 12,
                fontWeight: 700,
                lineHeight: "18px",
              }}
            >
              이름
            </Typography>
            <OutlinedInput
              id="name"
              value="김서연"
              readOnly
              fullWidth
              inputProps={{ "aria-label": "이름" }}
              sx={fieldSx}
            />
          </Stack>
          <Stack spacing={0.75}>
            <Typography
              component="label"
              htmlFor="email"
              sx={{
                color: "grey.700",
                fontSize: 12,
                fontWeight: 700,
                lineHeight: "18px",
              }}
            >
              이메일
            </Typography>
            <OutlinedInput
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seoyeon.kim@email.com"
              fullWidth
              inputProps={{ "aria-label": "이메일" }}
              sx={fieldSx}
            />
          </Stack>
          <Stack spacing={0.75}>
            <Typography
              component="label"
              htmlFor="password"
              sx={{
                color: "grey.700",
                fontSize: 12,
                fontWeight: 700,
                lineHeight: "18px",
              }}
            >
              비밀번호
            </Typography>
            <FormControl fullWidth>
              <OutlinedInput
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••••••"
                inputProps={{ "aria-label": "비밀번호" }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? "비밀번호 숨기기" : "비밀번호 보기"
                      }
                      edge="end"
                      onClick={() => setShowPassword((current) => !current)}
                      size="small"
                      sx={{ color: "grey.500" }}
                    >
                      {showPassword ? (
                        <Visibility fontSize="small" />
                      ) : (
                        <VisibilityOff fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
                sx={fieldSx}
              />
            </FormControl>
            <Typography
              sx={{ color: "grey.500", fontSize: 11, lineHeight: "16.5px" }}
            >
              영문·숫자·특수문자 포함 8자 이상
            </Typography>
          </Stack>
          <Stack spacing={0.75}>
            <Typography
              component="label"
              htmlFor="password-confirmation"
              sx={{
                color: "grey.700",
                fontSize: 12,
                fontWeight: 700,
                lineHeight: "18px",
              }}
            >
              비밀번호 확인
            </Typography>
            <FormControl fullWidth>
              <OutlinedInput
                id="password-confirmation"
                type={showPasswordConfirmation ? "text" : "password"}
                value={passwordConfirmation}
                onChange={(event) =>
                  setPasswordConfirmation(event.target.value)
                }
                placeholder="••••••••••••"
                inputProps={{ "aria-label": "비밀번호 확인" }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPasswordConfirmation
                          ? "비밀번호 확인 숨기기"
                          : "비밀번호 확인 보기"
                      }
                      edge="end"
                      onClick={() =>
                        setShowPasswordConfirmation((current) => !current)
                      }
                      size="small"
                      sx={{ color: "grey.500" }}
                    >
                      {showPasswordConfirmation ? (
                        <Visibility fontSize="small" />
                      ) : (
                        <VisibilityOff fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                }
                sx={fieldSx}
              />
            </FormControl>
          </Stack>
        </Stack>
        <Stack spacing={1.125}>
          {agreements.map((agreement) => (
            <Stack
              key={agreement.id}
              direction="row"
              alignItems="center"
              spacing={1}
              component="button"
              type="button"
              onClick={() => toggleAgreement(agreement.id)}
              sx={{
                width: "100%",
                p: 0,
                border: 0,
                bgcolor: "transparent",
                color: "inherit",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Checkbox
                checked={agreements[agreement.id]}
                tabIndex={-1}
                disableRipple
                icon={<RadioButtonUnchecked />}
                checkedIcon={<CheckCircleOutline />}
                sx={{
                  p: 0,
                  color: "grey.500",
                  "&.Mui-checked": { color: "grey.500" },
                  "& .MuiSvgIcon-root": { fontSize: 24 },
                }}
              />
              <Typography
                sx={{
                  flexGrow: 1,
                  color: "grey.700",
                  fontSize: 11,
                  lineHeight: "16.5px",
                }}
              >
                {agreement.label}
              </Typography>
              <ChevronRight sx={{ color: "grey.500", fontSize: 18 }} />
            </Stack>
          ))}
        </Stack>
        <Button
          type="submit"
          variant="contained"
          disableElevation
          sx={{
            height: 52,
            borderRadius: "14px",
            fontSize: 15,
            fontWeight: 700,
            bgcolor: "primary.main",
          }}
        >
          동의하고 계정 만들기
        </Button>
        <Typography
          align="center"
          sx={{ color: "grey.500", fontSize: 11, lineHeight: "16.5px" }}
        >
          또는 소셜 계정으로 시작하기
        </Typography>
        <Stack direction="row" justifyContent="space-between" sx={{ px: 3 }}>
          {socialProviders.map((provider) => (
            <Stack
              key={provider.id}
              alignItems="center"
              spacing={0.875}
              sx={{ width: 82 }}
            >
              <IconButton
                aria-label={`${provider.label}로 시작하기`}
                sx={{
                  width: 52,
                  height: 52,
                  border: provider.id === "google" ? "1px solid" : "none",
                  borderColor: "divider",
                  bgcolor:
                    provider.id === "naver"
                      ? "#03c75a"
                      : provider.id === "kakao"
                        ? "#fee500"
                        : "background.paper",
                  "&:hover": {
                    bgcolor:
                      provider.id === "naver"
                        ? "#03c75a"
                        : provider.id === "kakao"
                          ? "#fee500"
                          : "background.paper",
                  },
                }}
              >
                {provider.id === "google" && (
                  <Typography
                    sx={{
                      color: "#4285f4",
                      fontSize: 27,
                      fontWeight: 700,
                      lineHeight: 1,
                    }}
                  >
                    G
                  </Typography>
                )}
                {provider.id === "naver" && (
                  <Typography
                    sx={{
                      color: "common.white",
                      fontSize: 25,
                      fontWeight: 800,
                      lineHeight: 1,
                    }}
                  >
                    N
                  </Typography>
                )}
                {provider.id === "kakao" && (
                  <ChatBubble sx={{ color: "#191919", fontSize: 27 }} />
                )}
              </IconButton>
              <Typography
                align="center"
                sx={{ color: "grey.600", fontSize: 11, lineHeight: "16.5px" }}
              >
                {provider.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Typography
          align="center"
          sx={{ color: "grey.500", fontSize: 12, lineHeight: "18px" }}
        >
          이미 계정이 있나요?&nbsp;&nbsp;로그인
        </Typography>
      </Stack>
    </Box>
  );
};

export default Content;