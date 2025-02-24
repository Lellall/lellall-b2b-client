import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Step 1",
    description: "follow the process on the right to continue",
    status: "completed",
  },
  {
    number: 2,
    title: "Step 2",
    description: "Review your request for new supplies",
    status: "current",
  },
];

const InventoryStepper = () => {
  return (
    <div className="bg-white p-4 rounded-3xl space-y-4">
      {steps.map((step, index) => (
        <div key={step.number} className="relative">
          {index !== steps.length - 1 && (
            <div
              className={cn(
                "absolute left-5 top-12 h-full w-0.5 -ml-px",
                step.status === "completed" ? "bg-gray-700" : "bg-gray-200"
              )}
            />
          )}
          <div className="flex gap-4">
            <div
              className={cn(
                "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                step.status === "completed"
                  ? "border-gray-600 bg-gray-900 text-white"
                  : "border-gray-300 bg-white"
              )}
            >
              {step.status === "completed" ? (
                <Check color="white" className="h-5 w-5" />
              ) : (
                step.number
              )}
            </div>
            <div className="pt-2">
              <h3 className="font-medium">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryStepper;