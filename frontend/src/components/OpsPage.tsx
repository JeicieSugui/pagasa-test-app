import { alpha, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import StorageIcon from "@mui/icons-material/Storage";
import SpeedIcon from "@mui/icons-material/Speed";
import CodeIcon from "@mui/icons-material/Code";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningIcon from "@mui/icons-material/Warning";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useEffect, useState } from "react";
import { getHealth, getVersion, getTrends } from "../api/client";
import type { TrendsResponse, HealthResponse, VersionResponse } from "../types/api";
import PageContainer from "./PageContainer";

export default function OpsPage() {
  const theme = useTheme();
  const pageTitle = `Operations`;

  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [version, setVersion] = useState<VersionResponse | null>(null);
  const [trends, setTrends] = useState<TrendsResponse | null>(null);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => setHealth({ status: "error" }));
    getVersion().then(setVersion).catch(() => setVersion(null));
    getTrends().then(setTrends).catch(() => setTrends(null));
  }, []);

  const isHealthy = health?.status === "ready";
  const isDatabaseHealthy = health?.database === true;
  const isRedisHealthy = health?.redis === true;
  const palette = theme.palette;

  const metricCards = [
    {
      label: "Total Recent Runs",
      value: trends?.count ?? 0,
      accent: palette.primary.main,
      background: alpha(palette.primary.main, palette.mode === "dark" ? 0.22 : 0.08),
    },
    {
      label: "Avg Max Value",
      value: trends?.avg_max_value ? Number(trends.avg_max_value).toFixed(2) : "n/a",
      accent: palette.success.main,
      background: alpha(palette.success.main, palette.mode === "dark" ? 0.22 : 0.08),
    },
    {
      label: "Avg Mean Value",
      value: trends?.avg_mean_value ? Number(trends.avg_mean_value).toFixed(2) : "n/a",
      accent: palette.info.dark,
      background: alpha(palette.info.main, palette.mode === "dark" ? 0.22 : 0.08),
    },
    {
      label: "High Risk Runs",
      value: trends?.high_risk_runs ?? 0,
      accent: palette.error.main,
      background: alpha(palette.error.main, palette.mode === "dark" ? 0.22 : 0.08),
      icon: <WarningIcon sx={{ fontSize: 16, color: "inherit" }} />,
    },
  ];

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Home', path: '/' },
        { title: pageTitle },
      ]}
    >
      <Box sx={{ width: "100%", maxWidth: 1280, mx: "auto", px: { xs: 1, sm: 2 }, py: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mb: 1, display: "flex", alignItems: "center", gap: 1.5 }}
          >
            <AssessmentIcon sx={{ fontSize: 34, color: "primary.main" }} />
            System Operations Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Monitor system health, services, and performance trends
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                transition: "box-shadow 120ms ease, transform 120ms ease",
                "&:hover": {
                  boxShadow: theme.shadows[2],
                  transform: "translateY(-1px)",
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    System Status
                  </Typography>
                  {isHealthy ? (
                    <CheckCircleIcon sx={{ color: "success.main", fontSize: 30 }} />
                  ) : (
                    <ErrorIcon sx={{ color: "error.main", fontSize: 30 }} />
                  )}
                </Box>
                <Chip
                  label={health?.status ?? "unknown"}
                  color={isHealthy ? "success" : "error"}
                  size="medium"
                  sx={{ textTransform: "uppercase" }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                transition: "box-shadow 120ms ease, transform 120ms ease",
                "&:hover": {
                  boxShadow: theme.shadows[2],
                  transform: "translateY(-1px)",
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Database
                  </Typography>
                  <StorageIcon
                    sx={{
                      fontSize: 30,
                      color: isDatabaseHealthy ? "info.main" : "text.disabled",
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {isDatabaseHealthy ? (
                    <CheckCircleIcon sx={{ color: "success.main" }} />
                  ) : (
                    <ErrorIcon sx={{ color: "error.main" }} />
                  )}
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {isDatabaseHealthy ? "Connected" : "Disconnected"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                transition: "box-shadow 120ms ease, transform 120ms ease",
                "&:hover": {
                  boxShadow: theme.shadows[2],
                  transform: "translateY(-1px)",
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Redis Cache
                  </Typography>
                  <SpeedIcon
                    sx={{
                      fontSize: 30,
                      color: isRedisHealthy ? "warning.main" : "text.disabled",
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {isRedisHealthy ? (
                    <CheckCircleIcon sx={{ color: "success.main" }} />
                  ) : (
                    <ErrorIcon sx={{ color: "error.main" }} />
                  )}
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {isRedisHealthy ? "Connected" : "Disconnected"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <CodeIcon sx={{ color: "info.main", fontSize: 26 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Version Information
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    backgroundColor: alpha(palette.primary.main, palette.mode === "dark" ? 0.16 : 0.04),
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Application Version
                  </Typography>
                  <Typography variant="h6" sx={{ fontFamily: "monospace" }}>
                    {version?.app_version ?? "unavailable"}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    backgroundColor: alpha(palette.info.main, palette.mode === "dark" ? 0.16 : 0.04),
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Git Commit SHA
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: "monospace", fontSize: { xs: "0.95rem", sm: "1rem" } }}
                  >
                    {version?.git_sha ?? "unavailable"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <TrendingUpIcon sx={{ color: "primary.main", fontSize: 26 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Analytics Trends
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {metricCards.map((metric) => (
                <Grid key={metric.label} size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      textAlign: "center",
                      border: 1,
                      borderColor: alpha(metric.accent, palette.mode === "dark" ? 0.32 : 0.16),
                      background: `linear-gradient(135deg, ${metric.background} 0%, ${alpha(
                        metric.accent,
                        palette.mode === "dark" ? 0.3 : 0.14,
                      )} 100%)`,
                    }}
                  >
                    {metric.icon ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.75,
                          mb: 1.25,
                          color: metric.accent,
                        }}
                      >
                        {metric.icon}
                        <Typography variant="body2" color="text.secondary">
                          {metric.label}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
                        {metric.label}
                      </Typography>
                    )}
                    <Typography variant="h4" sx={{ fontWeight: 700, color: metric.accent }}>
                      {metric.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </PageContainer>
  );
}
