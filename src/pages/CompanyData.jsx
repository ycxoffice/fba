import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Link,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ExpandMore, Link as LinkIcon } from "@mui/icons-material";

// Smart value renderer with type detection
const renderValue = (value, depth = 0) => {
  if (value === null || value === undefined) return null;

  // Handle dates
  if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return new Date(value).toLocaleDateString();
  }

  // Handle URLs
  if (
    typeof value === "object" &&
    value.value &&
    typeof value.value === "string" &&
    value.value.match(/^https?:\/\//)
  ) {
    return (
      <Link
        href={value.value}
        target="_blank"
        rel="noopener"
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <LinkIcon fontSize="small" />
        {value.label || "View Link"}
      </Link>
    );
  }

  // Handle arrays
  if (Array.isArray(value)) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {value.map((item, index) => (
          <div
            key={index}
            style={{ padding: 8, backgroundColor: "#f8f9fa", borderRadius: 4 }}
          >
            {renderValue(item, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  // Handle nested objects
  if (typeof value === "object") {
    return (
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: depth % 2 === 0 ? "#f8f9fa" : "white",
          boxShadow: "none",
          border: "1px solid #e0e0e0",
        }}
      >
        <Table size="small">
          <TableBody>
            {Object.entries(value).map(([k, v]) => (
              <TableRow key={k} sx={{ "&:last-child td": { borderBottom: 0 } }}>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    width: "30%",
                    backgroundColor: "#f8f9fa",
                    borderRight: "1px solid #e0e0e0",
                  }}
                >
                  {k.replace(/_/g, " ")}
                </TableCell>
                <TableCell sx={{ padding: 1.5 }}>
                  {renderValue(v, depth + 1)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Handle booleans
  if (typeof value === "boolean") {
    return (
      <Chip
        label={value ? "Yes" : "No"}
        size="small"
        color={value ? "success" : "error"}
      />
    );
  }

  // Handle primitive values
  return value.toString();
};

// Main component
function CompanyData() {
  const { companyName } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [fetchedData, setFetchedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5001/api/audit/${companyName}`);
        if (!response.ok) throw new Error("Failed to fetch company data");
        const data = await response.json();
        setFetchedData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [companyName]);

  if (loading) return <Typography style={{color:"blue" ,textAlign:"center" , marginTop:"15%" }}>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!fetchedData) return <Typography>No data available</Typography>;

  return (
    <div
      style={{
        padding: isMobile ? 16 : 24,
        backgroundColor: "white",
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* Company Header */}
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? 16 : 24,
          marginBottom: isMobile ? 24 : 32,
        }}
      >
        <div>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            {fetchedData.data.properties?.title}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {fetchedData.data.properties?.short_description}
          </Typography>
        </div>
      </div>

      {/* Dynamic Sections */}
      {Object.entries(fetchedData.data).map(([sectionKey, sectionValue]) => (
        <Accordion key={sectionKey} defaultExpanded elevation={0}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography
              variant="h6"
              sx={{
                textTransform: "uppercase",
                letterSpacing: 1,
                fontSize: isMobile ? "1rem" : "1.25rem",
              }}
            >
              {sectionKey.replace(/_/g, " ")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableBody>
                  {Object.entries(sectionValue).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell
                        sx={{
                          fontWeight: 500,
                          width: isMobile ? "40%" : "30%",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        {key.replace(/_/g, " ")}
                      </TableCell>
                      <TableCell sx={{ padding: isMobile ? 1 : 1.5 }}>
                        {renderValue(value)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Special Handling for Lists */}
      <Accordion defaultExpanded elevation={0}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography
            variant="h6"
            sx={{
              textTransform: "uppercase",
              letterSpacing: 1,
              fontSize: isMobile ? "1rem" : "1.25rem",
            }}
          >
            Key Employee Changes
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {fetchedData.data.info?.key_employee_change_list?.map(
            (change, index) => (
              <Accordion key={index} elevation={0}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography sx={{ fontSize: isMobile ? "0.9rem" : "1rem" }}>
                    {change.press_reference_link?.label}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>{renderValue(change)}</AccordionDetails>
              </Accordion>
            )
          )}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

export default CompanyData;
