import BookOutlined from "@mui/icons-material/BookOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import Flight from "@mui/icons-material/Flight";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import LuggageOutlined from "@mui/icons-material/LuggageOutlined";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

const featureItems = [
  {
    title: "내 속도에 맞는 여행 계획",
    description: "가고 싶은 곳을 모아 일정을 만들어요.",
    icon: CalendarMonthOutlined,
  },
  {
    title: "빈 시간엔, 가까운 발견",
    description: "AI가 주변의 어울리는 장소를 찾아줘요.",
    icon: LocationOnOutlined,
  },
  {
    title: "인연도 기록도, 나의 수첩에",
    description: "원할 때만 연결하고, 추억은 저장해요.",
    icon: BookOutlined,
  },
];

export const OnboardingContent = () => {
  return (
    <Box
      component="main"
      sx={{
        boxSizing: "border-box",
        width: "100%",
        maxWidth: 522,
        minHeight: "100dvh",
        mx: "auto",
        px: { xs: 4.5, sm: 4.5 },
        pt: { xs: 10.5, sm: 11 },
        pb: 4.5,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        bgcolor: "common.white",
      }}
    >
      <Stack component="section" spacing={6.25}>
        <Stack component="header" spacing={2.5}>
          <Box
            aria-hidden="true"
            sx={{
              height: 125,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                width: "85%",
                height: 56,
                borderTop: "1px solid",
                borderColor: "#C9D9F2",
                borderRadius: "50%",
                transform: "translateY(16px)",
              },
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 94,
                border: "1px solid",
                borderColor: "#B8CCE9",
                borderRadius: 4,
                bgcolor: "rgba(255,255,255,0.96)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 1,
                boxShadow: "0 0 0 5px rgba(241,245,252,0.55)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 8,
                  width: 24,
                  height: 4,
                  borderRadius: 4,
                  bgcolor: "#D6E1F2",
                },
              }}
            >
              <LuggageOutlined sx={{ fontSize: 45, color: "#D3DFF0" }} />
              <Box
                sx={{
                  position: "absolute",
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  bgcolor: "#244790",
                  top: 28,
                  right: 19,
                }}
              />
            </Box>
            <Flight
              sx={{
                position: "absolute",
                right: "8%",
                top: 26,
                fontSize: 21,
                color: "#244790",
                transform: "rotate(18deg)",
              }}
            />
          </Box>
          <Stack spacing={2}>
            <Typography
              component="h1"
              sx={{
                color: "#244790",
                fontSize: { xs: 32, sm: 36 },
                fontWeight: 700,
                letterSpacing: "-0.7px",
                lineHeight: 1.3,
                wordBreak: "keep-all",
              }}
            >
              계획 사이, 새로운 발견 ✈️
            </Typography>
            <Typography
              sx={{
                color: "#727D8D",
                fontSize: 20,
                fontWeight: 400,
                lineHeight: 1.9,
                letterSpacing: "-0.25px",
                wordBreak: "keep-all",
              }}
            >
              나만의 속도로 여행하고,
              <br />
              우연히 만난 인연까지 간직해요.
            </Typography>
          </Stack>
        </Stack>
        <Stack component="section" aria-label="서비스 특징" spacing={4.5}>
          {featureItems.map(({ title, description, icon: Icon }) => (
            <Stack
              key={title}
              direction="row"
              spacing={2.25}
              alignItems="center"
            >
              <Paper
                elevation={0}
                sx={{
                  width: 55,
                  height: 55,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2.5,
                  bgcolor: "#F1F5FC",
                }}
              >
                <Icon sx={{ color: "#28509B", fontSize: 27 }} />
              </Paper>
              <Stack spacing={0.5}>
                <Typography
                  component="h2"
                  sx={{
                    color: "#203B69",
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: 1.45,
                    letterSpacing: "-0.3px",
                    wordBreak: "keep-all",
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  sx={{
                    color: "#727D8D",
                    fontSize: 16,
                    lineHeight: 1.5,
                    letterSpacing: "-0.2px",
                    wordBreak: "keep-all",
                  }}
                >
                  {description}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
      <Stack component="footer" spacing={1.25} sx={{ pt: 5 }}>
        <Button
          variant="contained"
          fullWidth
          disableElevation
          sx={{
            height: 70,
            borderRadius: 2.5,
            bgcolor: "#2C539B",
            fontSize: 17,
            fontWeight: 700,
            "&:hover": {
              bgcolor: "#244790",
            },
          }}
        >
          계정 만들기
        </Button>
        <Button
          variant="text"
          fullWidth
          sx={{
            height: 46,
            borderRadius: 2.5,
            color: "#244790",
            fontSize: 17,
            fontWeight: 700,
          }}
        >
          로그인
        </Button>
      </Stack>
    </Box>
  );
};

export default OnboardingContent;