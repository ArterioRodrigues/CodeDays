import React, { useState } from "react";
import './drag-drop-file.css';

// drag drop file component
function DragDropFile() {

  const [file, setFile] = useState(null);
  const [responseData, setResponseData] = useState(null); // Holds server response
  const [errorMessage, setErrorMessage] = useState(null); // Holds server error
  const [isLoading, setIsLoading] = useState(false); // Tracks loading status
  // drag state
  const [dragActive, setDragActive] = React.useState(false);
  const [jobPosition, setJobPosition] = useState(''); // Holds the job position
  const [jobDescription, setJobDescription] = useState(''); // Holds the job description
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState([]);
  const [isAnswerVisible, setIsAnswerVisible] = useState([]); // Holds the visibility state of each answer
  const [isFeedbackVisible, setIsFeedbackVisible] = useState([]); // Holds the visibility state of AI feedback for each question
  const [feedbackError, setFeedbackError] = useState([]);


  // Function to toggle the visibility of an answer
  const toggleAnswerVisibility = (index) => {
    setIsAnswerVisible((prevVisibility) => {
     const newVisibility = [...prevVisibility];
      newVisibility[index] = !newVisibility[index];
      return newVisibility;
    });
  };

  // Function to toggle the visibility of AI feedback for a specific question
  const toggleFeedbackVisibility = (index) => {
    setIsFeedbackVisible((prevVisibility) => {
      const newVisibility = [...prevVisibility];
      newVisibility[index] = !newVisibility[index];
      return newVisibility;
    });
  };
  
  const handleJobPositionChange = (e) => {
    setJobPosition(e.target.value);
  }

  const handleJobDescriptionChange = (e) => {
    setJobDescription(e.target.value);
  }
  
  // handle drag events
  const handleDrag = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
    
  // triggers when file is dropped
  const handleDrop = function(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setFile(e.dataTransfer.files[0]);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    setIsLoading(true); // Set loading to true when request starts
    setFeedbackLoading([]);
    setFeedbacks([]);
    setFeedbackError([]);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobPosition', jobPosition);
    formData.append('jobDescription', jobDescription);

    try {
        const response = await fetch('https://codedaysbackend.onrender.com/upload', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            setErrorMessage(data.error); // Update the error message state
            throw new Error(`HTTP error! status: ${response.status}`);
        } else {
            setResponseData(data.content); // Set the response data in state
        }
    } catch (error) {
        console.log(error);
    } finally {
        setIsLoading(false); // Set loading to false after request finishes
    }
  }

  const handleAnswerSubmit = async (question, index) => {
    // Set loading state for the specific question
    setFeedbackLoading(prevLoading => {
      const newLoading = [...prevLoading];
      newLoading[index] = true;
      return newLoading;
    });
  
    // Clear previous feedback for the specific question
    setFeedbacks(prevFeedbacks => {
      const newFeedbacks = [...prevFeedbacks];
      newFeedbacks[index] = null;
      return newFeedbacks;
    });
    setFeedbackError(prevFeedbackError => {
      const newFeedbackError = [...prevFeedbackError];
      newFeedbackError[index] = null;
      return newFeedbackError;
    });
    
    const answerTextArea = document.getElementById(`answer-${index}`);
    const answer = answerTextArea.value;
  
    try {
      const response = await fetch('https://codedaysbackend.onrender.com/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          answer,
        }),
      });
  
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      } else {
        // Process the response if needed
        console.log(data);
        setFeedbacks(prevFeedbacks => {
          const newFeedbacks = [...prevFeedbacks];
          newFeedbacks[index] = data.feedback;
          return newFeedbacks;
        });
      }
    } catch (error) {
      console.log(error);
      // Set the error message for the specific question
      setFeedbackError(prevError => {
        const newError = [...prevError];
        newError[index] = error.message.includes('400') ? 'No Answer Submitted' : 'An error occurred';
        return newError;
      });
      // Unset loading state for the specific question
      setFeedbackLoading(prevLoading => {
        const newLoading = [...prevLoading];
        newLoading[index] = false;
        return newLoading;
      });
    } finally {
      // Unset loading state for the specific question
      setFeedbackLoading(prevLoading => {
        const newLoading = [...prevLoading];
        newLoading[index] = false;
        return newLoading;
      });
    }
  };


  return (
    <div className="flex flex-col mb-10 mx-auto">
    
    <div className="flex justify-center items-center font-bold text-xl text-[#FFFFFF] bg-[#3C82F6] h-20">Resume Talk</div>

    <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>    
      <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : "" }>        
        <div>
          <h1 className="resume box m-7">Drag & Drop Your Resume Here!</h1>
          {/* Display the selected file name */}
          
          {file && (
            <div>
              <p className="file-text text-sm text-green-600 m-7">Selected File: {file.name}</p>
            </div>
          )}

          {errorMessage ? (
          <div>
            <p className="error-text text-sm text-red-500">Error:</p>
            <p className="error-message text-sm text-red-500">{errorMessage}</p>
          </div>
          ) : null}

        </div>       
      </label>   
      { dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div> }
    </form>

    <textarea style={{ position: 'absolute', transform: 'translate(108%, 165%)', width: '46%', maxWidth: '50%', height: '3rem', minHeight: '3rem', maxHeight: '3rem', margin: '30px' }} // Use textarea for multiline text input
      placeholder="Optional Job Position..."
      className="p-2 bg-transparent border-2 border-[#cbd5e1] rounded-2xl focus:outline-none px-5 py-2.5"
      onChange={handleJobPositionChange}
    />

    <textarea style={{ position: 'absolute', transform: 'translate(108%, 75%)', width: '46%', maxWidth: '50%', height: '12rem', minHeight: '12rem', maxHeight: '12rem', margin: '30px' }} // Use textarea for multiline text input
      placeholder="Optional Job Description..."
      className="p-2 bg-transparent border-2 border-[#cbd5e1] rounded-2xl focus:outline-none px-5 py-4"
      onChange={handleJobDescriptionChange}
    />

    <button onClick={handleSubmit}
      className="inline-block px-4 py-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 mx-auto font-medium"
    >Generate AI-Powered Questions!</button>

    {/* Conditionally rendering loading text or server response */}
    {isLoading ? (
      <div className="mt-5 m-8 text-blue-600">
        <p>Loading...</p>
      </div>
      ) : responseData ? (
        <div className="mt-5 m-7">
          <h3 className="text-xl mb-7">Interview Questions:</h3>
          {responseData.split('\n').map((response, index) => (
          <div key={index} className="border p-4 rounded-2xl shadow-md mb-4 bg-[#cbd5e1]">
          <button
            className="text-gray-100 hover:underline focus:outline-none"
            onClick={() => toggleAnswerVisibility(index)}>
            <p className="text-black text-lg font-bold">Question {index + 1}</p>
          </button>
        {isAnswerVisible[index] && (
          <div>
            <p>{response}</p>
            <textarea
              id={`answer-${index}`}
              className="p-2 text-black bg-gray-100 mt-2 rounded-2xl resize-none w-full px-5 py-4"
              placeholder="Answer the question here..."
              rows="3">
            </textarea>
            <div class="flex justify-end">
              <button
                className="px-4 py-2 mt-2 bg-gray-900 text-white rounded-2xl hover:bg-black focus:outline-none focus:ring focus:ring-gray-100"
                onClick={() => handleAnswerSubmit(response, index)}
              >
                Submit
              </button>
            </div>
            {/* Display the loading message or error */}
            {feedbackLoading[index] ? (
              <p className="text-blue-600">Generating AI Feedback...</p>
            ) : feedbackError[index] ? (
              <p className="text-red-600">{feedbackError[index]}</p>
            ) : (
            // Display "Show Feedback" button when feedback is available
            <div class="flex justify-end">
              {feedbacks[index] && (
                <button
                  className="px-4 py-2 mt-2 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                  onClick={() => toggleFeedbackVisibility(index)}
                >
                  {isFeedbackVisible[index] ? 'Hide AI Feedback' : 'Show AI Feedback'}
                </button>
              )}
            </div>
            )}
            {isFeedbackVisible[index] && feedbacks[index] && (
            <div>
              <p className="text-black p-2 bg-gray-100 rounded-2xl resize-none w-full px-5 py-4 mt-4">
                {feedbacks[index]}
              </p>
            </div>
            )}
          </div>
          )}
        </div>
        ))}
      </div>
    ) : null}
    </div>
  );
}

export default DragDropFile;
