import { useState, useEffect, useMemo } from "react";

const useKnowYourAICompanies = ({ search }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sheetId = "1098MT3Wgfzia7dKjxAyr7jxgH5PpdAt3AOaoII2J9xw";
        const tabId = "794818920";
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&gid=${tabId}`;
        const response = await fetch(url);
        const text = await response.text();
        const jsonData = JSON.parse(text.substring(47).slice(0, -2));
        const headers = jsonData.table.cols.map((col) => col.label);
        const rows = jsonData.table.rows.map((row) => {
          const company = {};
          row.c.forEach((cell, i) => {
            if (headers[i]) company[headers[i]] = cell ? cell.v : "";
          });
          return {
            name: company["Company Name"],
            industry: company["Industry"],
            location: company["Headquarters"],
            website: company["Website"],
            source: "knowyourai",
          };
        });
        setCompanies(rows);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
        console.error("Error fetching knowyourai data:", err);
      }
    };
    fetchData();
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) =>
      [company.name, company.industry, company.location].some((field) =>
        field?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [companies, search]);

  return { filteredCompanies, loading, error };
};

export default useKnowYourAICompanies;
