import React, { useState } from "react";
import axios from "axios";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [latexTemplate, setLatexTemplate] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpInput, setFollowUpInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [templateLog, setTemplateLog] = useState([]);

  // Styles
  const containerStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "'Roboto', sans-serif",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "30px",
    color: "#6200EE",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginBottom: "20px",
  };

  const buttonStyle = {
    backgroundColor: "#6200EE",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "4px",
    cursor: "pointer",
  };

  const buttonDisabledStyle = {
    ...buttonStyle,
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: "120px",
  };

  const errorStyle = {
    color: "red",
    marginTop: "10px",
    fontWeight: "bold",
  };

  const preStyle = {
    whiteSpace: "pre-wrap",
    background: "#f5f5f5",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "14px",
  };

  const waitNoteStyle = {
    marginTop: "10px",
    color: "#555",
    fontStyle: "italic",
  };

  // Handlers
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleTemplateChange = (e) => {
    setLatexTemplate(e.target.value);
  };

  const handleFollowUpChange = (e) => {
    setFollowUpInput(e.target.value);
  };

  const handleCopy = () => {
    if (extractedData && extractedData.result) {
      navigator.clipboard.writeText(extractedData.result);
      alert("Modified LaTeX template copied to clipboard!");
    }
  };

  const addToTemplateLog = (template) => {
    setTemplateLog((prevLog) => {
      if (!prevLog.includes(template)) {
        return [...prevLog, template];
      }
      return prevLog;
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }
    if (!latexTemplate.trim()) {
      setError("Please provide a LaTeX template.");
      return;
    }
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("template", latexTemplate);

    try {
      const response = await axios.post("https://latexresumecreator.onrender.com/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setExtractedData(response.data);
      addToTemplateLog(latexTemplate);
      if (
        response.data &&
        response.data.result &&
        response.data.result.toLowerCase().includes("please provide")
      ) {
        setFollowUpRequired(true);
      } else {
        setFollowUpRequired(false);
      }
    } catch (err) {
      setError("Error uploading file or extracting data.");
      console.error(err);
    }
    setLoading(false);
  };

  const handleFollowUpSubmit = async () => {
    if (!followUpInput.trim()) {
      setError("Please provide the required details.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("https://latexresumecreator.onrender.com/followup", {
        followUp: followUpInput,
        pdf_text: extractedData.pdf_text,
        template: latexTemplate,
      });
      setExtractedData(response.data);
      setFollowUpRequired(false);
    } catch (err) {
      setError("Error submitting follow-up details.");
      console.error(err);
    }
    setLoading(false);
  };

  let displayContent = null;
  if (extractedData && extractedData.result) {
    displayContent = (
      <div style={{ marginTop: "30px" }}>
        <h2 style={{ color: "#6200EE" }}>Modified LaTeX Template</h2>
        <button onClick={handleCopy} style={{ ...buttonStyle, marginBottom: "10px" }}>
          Copy to Clipboard
        </button>
        <pre style={preStyle}>{extractedData.result}</pre>
      </div>
    );
  }

  let followUpContent = null;
  if (followUpRequired) {
    followUpContent = (
      <div style={{ marginTop: "30px", border: "1px solid #6200EE", padding: "20px", borderRadius: "4px" }}>
        <h2 style={{ color: "#6200EE" }}>Additional Details Required</h2>
        <p>
          The system requires further information (e.g. missing links or references).
          Please provide the additional details below.
        </p>
        <textarea
          placeholder="Enter additional details here..."
          value={followUpInput}
          onChange={handleFollowUpChange}
          rows={5}
          style={textareaStyle}
        />
        <button
          onClick={handleFollowUpSubmit}
          disabled={loading}
          style={loading ? buttonDisabledStyle : buttonStyle}
        >
          {loading ? "Submitting..." : "Submit Additional Details"}
        </button>
      </div>
    );
  }

  let logContent = null;
  if (templateLog.length > 0) {
    logContent = (
      <div style={{ marginTop: "30px" }}>
        <h2 style={{ color: "#6200EE" }}>Previously Used Templates</h2>
        <ul>
          {templateLog.map((template, index) => (
            <li key={index} style={{ marginBottom: "10px", padding: "10px", background: "#e0e0e0", borderRadius: "4px" }}>
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", margin: 0 }}>{template}</pre>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>LaTeX Template Modifier</h1>
      <div style={{ marginBottom: "20px" }}>
        <input type="file" accept="application/pdf" onChange={handleFileChange} style={inputStyle} />
      </div>
      <div style={{ marginBottom: "20px" }}>
        <textarea
          placeholder="Enter your LaTeX template here..."
          value={latexTemplate}
          onChange={handleTemplateChange}
          rows={10}
          style={textareaStyle}
        />
      </div>
      <button onClick={handleUpload} disabled={loading} style={loading ? buttonDisabledStyle : buttonStyle}>
        {loading ? "Processing..." : "Upload and Modify Template"}
      </button>
      {loading && <p style={waitNoteStyle}>Processing request. Please wait 2-5 minutes...</p>}
      {error && <p style={errorStyle}>{error}</p>}
      {followUpContent}
      {displayContent}
      {logContent}
    </div>
  );
}

export default App;