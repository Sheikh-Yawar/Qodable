import React, { useEffect, useState } from "react";
import { ThreeDots } from "react-loader-spinner";
import Editor from "@monaco-editor/react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./App.css";

function App() {
  const [code, setCode] = useState();
  const [isListening, setIsListening] = useState(false);
  const [codeGenerated, setCodeGenerated] = useState(true);
  const [importsArray, setImportsArray] = useState([]);
  const [imports, setImports] = useState("");
  const [body, setBody] = useState("");
  const { transcript, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    handleNewCode(imports + body);
  }, [body, imports]);

  const appendCode = (code) => {
    let concatenatedBody = "";

    for (let i = 0; i < code.length; i++) {
      concatenatedBody += code[i] + "\n";
    }
    setBody((prevCode) => prevCode + concatenatedBody);
  };

  const appendImports = (newImports) => {
    console.log("Imports:", imports);
    if (newImports.length === 0) {
      return;
    }

    const uniqueImports = newImports.filter(
      (importItem) => !importsArray.includes(importItem)
    );

    if (uniqueImports.length === 0) {
      return;
    }

    let concatenatedImports = "";

    for (let i = 0; i < uniqueImports.length; i++) {
      concatenatedImports += uniqueImports[i] + "\n";
    }

    console.log("Concatenated imports are", concatenatedImports);
    setImports((prevImports) => prevImports + concatenatedImports);
    setImportsArray((prevImports) => [...prevImports, ...uniqueImports]);
  };

  const handleMicClick = () => {
    if (!isListening) {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
      setIsListening(true);
    } else {
      setCodeGenerated(false);
      SpeechRecognition.stopListening();
      const instruction = transcript.trim();
      const apiUrl = `http://127.0.0.1:5000/qd/python?instruct=${instruction}`;

      // Send API request
      fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          appendImports(data.imports);
          appendCode(data.statements);
          setCodeGenerated(true);
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      setIsListening(false);
    }
  };

  const handleNewCode = (newCode) => {
    setCode(newCode);
  };

  return (
    <div>
      <div className="header">
        <p>Qodable</p>
      </div>
      {!codeGenerated && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "40%",
            zIndex: "200",
          }}
        >
          <ThreeDots
            visible={true}
            height="80"
            width="80"
            radius="20"
            color="#31b285"
            ariaLabel="watch-loading"
          />
        </div>
      )}

      <Editor
        height="100vh"
        width="100vw"
        language="python"
        theme="vs-dark"
        value={code}
        onChange={handleNewCode}
        options={{
          fontSize: 20,
          fontFamily: "Fira Code",
          padding: {
            top: 10,
          },
          bracketPairColorization: true,
          smoothScrolling: true,
          autoIndent: "full",
        }}
      />
      {!isListening && (
        <div
          onClick={handleMicClick}
          title="Start Asking"
          className="microphone"
        >
          <img src="../assets/mic.png" />
        </div>
      )}
      {isListening && (
        <div
          onClick={handleMicClick}
          title="Stop Asking"
          className="microphone"
          style={{
            backgroundColor: "transparent",
          }}
        >
          <img src="../assets/stop.png" />
        </div>
      )}

      {isListening && <div className="footer">{transcript}</div>}
    </div>
  );
}

export default App;
