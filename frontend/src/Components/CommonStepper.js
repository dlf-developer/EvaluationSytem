import React from 'react';
import { Steps } from 'antd';

const CommonStepper = ({ currentStep, current, steps = [], direction }) => {
  const activeStep = currentStep !== undefined ? currentStep : (current !== undefined ? current : 0);
  return (
    <Steps current={activeStep} direction={direction}>
      {steps.map((step, index) => (
        <Steps.Step
          key={index}
          title={step.title}
          description={step.description}
          subTitle={step.subTitle}
        />
      ))}
    </Steps>
  );
};

export default CommonStepper;
