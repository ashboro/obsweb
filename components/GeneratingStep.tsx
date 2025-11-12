
import React from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface GeneratingStepProps {
  isScorm?: boolean;
}

const GeneratingStep: React.FC<GeneratingStepProps> = ({ isScorm = false }) => {
  const websiteMessages = [
    "Warming up the AI brain cells...",
    "Stitching together HTML & CSS...",
    "Consulting the design spirits...",
    "Making pixels perfect...",
    "Finalizing the digital masterpiece...",
  ];
  
  const scormMessages = [
    "Consulting instructional design principles...",
    "Building the learning module...",
    "Writing the SCORM manifest file...",
    "Packaging your course for the LMS...",
    "Almost ready for prime time learning...",
  ];
  
  const messages = isScorm ? scormMessages : websiteMessages;
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setMessage(messages[index]);
    }, 2500);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center transition-all duration-500">
      <SpinnerIcon className="w-16 h-16 text-purple-400" />
      <h2 className="text-2xl font-semibold text-gray-200 mt-6 mb-2">
        {isScorm ? "Building Your SCORM Package" : "Building Your Website"}
      </h2>
      <p className="text-gray-400 w-full text-center">{message}</p>
    </div>
  );
};

export default GeneratingStep;