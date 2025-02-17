import { Button } from "@/components/ui/button"
import { InfoIcon, File } from "lucide-react"

const FileUploadSection = () => {
  return (
    <div className="space-y-8">
      {/* CSV Template Section */}
      <div className="bg-[#0F2116]/[.07] p-6 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full flex items-center justify-center">
            <InfoIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium mb-1 text-[#151515]">Preparing a CSV</h3>
            <p className="text-sm text-[#454545] mb-3">
              We have provided you with CSV template for requesting your supplies, click the button below to download
              the template.
            </p>
            <Button variant="link" className="text-blue-600 p-0">
              Download template
            </Button>
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="border-2 border-dashed rounded-lg p-8">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-2 border-dashed rounded-full bg-gray-100 mx-auto flex items-center justify-center">
            <File className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="font-medium">Drop your Files Here</h3>
          <p className="text-sm text-gray-500">
            <Button variant="link" className="text-blue-600 p-0">
              Browse Files
            </Button>{" "}
            from your Computer
          </p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">Or use the form below to add items manually</div>
    </div>
  )
}

export default FileUploadSection
