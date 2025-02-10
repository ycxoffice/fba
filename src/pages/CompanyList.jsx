import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, CircularProgress } from "@mui/material";
function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5001/api/audit?search=${search}&page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        setCompanies(data.companies);
        setTotal(data.total);
        setLoading(false);
      });
  }, [search, page]);
  return (
    <div style={{ padding: "20px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <h2 style={{ color: "#333", marginBottom: "20px" }}>Company List</h2>
      <TextField
        label="Search Company"
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: "20px" }}
      />
      {loading ? (
        <CircularProgress style={{ display: "block", margin: "20px auto" }} />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: "bold" }}>Company Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((company, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Link to={`/${encodeURIComponent(company.company_name)}`} style={{ textDecoration: "none", color: "#1976D2" }}>
                      {company.company_name}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Pagination
        count={Math.ceil(total / limit)}
        page={page}
        onChange={(_, newPage) => setPage(newPage)}
        style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}
      />
    </div>
  );
}
export default CompanyList;
