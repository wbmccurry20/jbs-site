import { useState } from 'react';
import { motion } from 'framer-motion';

interface QuoteCalculatorProps {
  client?: string;
}

interface ProjectDetails {
  projectType: string;
  squareFootage: string;
  timeline: string;
  budget: string;
}

export default function QuoteCalculator({ client }: QuoteCalculatorProps) {
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<ProjectDetails>({
    projectType: '',
    squareFootage: '',
    timeline: '',
    budget: '',
  });

  const projectTypes = [
    { value: 'new-build', label: '🏗️ New Home Construction', base: 250 },
    { value: 'renovation', label: '🔨 Full Renovation', base: 150 },
    { value: 'addition', label: '📐 Home Addition', base: 200 },
    { value: 'outdoor', label: '🌳 Outdoor Living Space', base: 100 },
    { value: 'green', label: '♻️ Green Building Project', base: 300 },
  ];

  const calculateEstimate = () => {
    const selectedType = projectTypes.find(t => t.value === details.projectType);
    if (!selectedType || !details.squareFootage) return null;

    const sqft = parseInt(details.squareFootage);
    const basePrice = selectedType.base;
    const estimate = sqft * basePrice;
    
    return {
      low: (estimate * 0.85).toLocaleString(),
      high: (estimate * 1.15).toLocaleString(),
      avg: estimate.toLocaleString(),
    };
  };

  const estimate = calculateEstimate();

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
      <h3 className="text-3xl font-display font-bold text-construction-dark mb-2">
        Project Cost Calculator
      </h3>
      <p className="text-construction-steel mb-8">
        Get an instant estimate for your construction project
      </p>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
                step >= s
                  ? 'bg-construction-primary text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {s}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-construction-primary to-construction-accent"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step 1: Project Type */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-3"
        >
          <label className="block text-sm font-semibold text-construction-dark mb-3">
            What type of project are you planning?
          </label>
          {projectTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => {
                setDetails({ ...details, projectType: type.value });
                setStep(2);
              }}
              className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-construction-primary hover:bg-construction-primary/5 transition-all group"
            >
              <span className="text-lg font-medium group-hover:text-construction-primary">
                {type.label}
              </span>
              <span className="block text-sm text-construction-steel mt-1">
                Starting at ${type.base}/sq ft
              </span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Step 2: Square Footage */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <label className="block text-sm font-semibold text-construction-dark mb-3">
            Approximate square footage?
          </label>
          <input
            type="number"
            value={details.squareFootage}
            onChange={(e) =>
              setDetails({ ...details, squareFootage: e.target.value })
            }
            placeholder="e.g., 2000"
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-construction-primary focus:outline-none text-lg"
          />
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex-1 px-6 py-3 border-2 border-construction-primary text-construction-primary rounded-lg font-semibold hover:bg-construction-primary/5"
            >
              Back
            </button>
            <button
              onClick={() => details.squareFootage && setStep(3)}
              disabled={!details.squareFootage}
              className="flex-1 px-6 py-3 bg-construction-primary text-white rounded-lg font-semibold hover:bg-construction-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Timeline */}
      {step === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <label className="block text-sm font-semibold text-construction-dark mb-3">
            When would you like to start?
          </label>
          <div className="space-y-3">
            {[
              { value: 'asap', label: 'As soon as possible' },
              { value: '1-3months', label: 'Within 1-3 months' },
              { value: '3-6months', label: 'Within 3-6 months' },
              { value: 'planning', label: 'Just planning ahead' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setDetails({ ...details, timeline: option.value });
                  setStep(4);
                }}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-construction-primary hover:bg-construction-primary/5 transition-all"
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full mt-6 px-6 py-3 border-2 border-construction-primary text-construction-primary rounded-lg font-semibold hover:bg-construction-primary/5"
          >
            Back
          </button>
        </motion.div>
      )}

      {/* Step 4: Results */}
      {step === 4 && estimate && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="mb-6">
            <div className="inline-block p-4 bg-construction-primary/10 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-construction-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-construction-dark mb-2">
              Your Estimated Project Cost
            </h4>
            <p className="text-construction-steel">
              Based on {details.squareFootage} sq ft
            </p>
          </div>

          <div className="bg-gradient-to-br from-construction-primary to-construction-accent p-8 rounded-xl text-white mb-6">
            <div className="text-5xl font-bold mb-2">${estimate.avg}</div>
            <div className="text-sm opacity-90">
              Range: ${estimate.low} - ${estimate.high}
            </div>
          </div>

          <p className="text-sm text-construction-steel mb-6">
            This is a rough estimate. Contact us for a detailed quote based on
            your specific requirements.
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 px-6 py-3 border-2 border-construction-primary text-construction-primary rounded-lg font-semibold hover:bg-construction-primary/5"
            >
              Start Over
            </button>
            <a
              href="/contact"
              className="flex-1 px-6 py-3 bg-construction-primary text-white rounded-lg font-semibold hover:bg-construction-primary/90"
            >
              Get Detailed Quote
            </a>
          </div>
        </motion.div>
      )}
    </div>
  );
}
