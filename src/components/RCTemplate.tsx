import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';

interface RCData {
  vehicleNumber?: string;
  ownerName?: string;
  vehicleClass?: string;
  fuelType?: string;
  chassisNumber?: string;
  engineNumber?: string;
  manufacturer?: string;
  model?: string;
  registrationDate?: string;
  insuranceValidTill?: string;
  rtoOffice?: string;
  ownerAddress?: string;
}

interface RCTemplateProps {
  rcData: RCData;
}

const RCTemplate = ({ rcData }: RCTemplateProps) => {
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const generatePDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GOVERNMENT OF TAMIL NADU', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text('_'.repeat(50), pageWidth / 2, 25, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.text('REGISTRATION CERTIFICATE (RC)', pageWidth / 2, 35, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Motor Vehicles Act, 1988', pageWidth / 2, 42, { align: 'center' });

      // Content
      let yPos = 60;
      const lineHeight = 8;
      
      const fields = [
        ['1. Registration Number:', rcData.vehicleNumber || 'N/A'],
        ['2. Owner Name:', rcData.ownerName || 'N/A'],
        ['3. Vehicle Class:', rcData.vehicleClass || 'N/A'],
        ['4. Fuel Type:', rcData.fuelType || 'N/A'],
        ['5. Chassis Number:', rcData.chassisNumber || 'N/A'],
        ['6. Engine Number:', rcData.engineNumber || 'N/A'],
        ['7. Manufacturer:', rcData.manufacturer || 'N/A'],
        ['8. Model:', rcData.model || 'N/A'],
        ['9. Registration Date:', formatDate(rcData.registrationDate || '')],
        ['10. Insurance Valid Till:', formatDate(rcData.insuranceValidTill || '')],
        ['11. RTO Office:', rcData.rtoOffice || 'N/A'],
        ['12. Address of Owner:', rcData.ownerAddress || 'N/A']
      ];

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      fields.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, 20, yPos);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, 70, yPos);
        yPos += lineHeight;
      });

      // Footer
      yPos += 20;
      pdf.text('_'.repeat(60), pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
      pdf.setFont('helvetica', 'italic');
      pdf.text('Signature of Registering Authority', pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
      pdf.text('(TAMIL NADU STATE TRANSPORT DEPARTMENT)', pageWidth / 2, yPos, { align: 'center' });

      // Save the PDF
      const fileName = `${rcData.vehicleNumber?.replace(/\s/g, '') || 'RC'}_RC.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Downloaded",
        description: `RC document saved as ${fileName}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-[var(--shadow-elegant)] bg-[image:var(--gradient-card)] border-0 animate-fade-in">
      <CardHeader className="text-center bg-[image:var(--gradient-primary)] text-white py-8 rounded-t-lg">
        <CardTitle className="text-2xl font-bold mb-3">
          GOVERNMENT OF TAMIL NADU
        </CardTitle>
        <div className="text-sm opacity-90 mb-3">
          ________________________________________________
        </div>
        <div className="text-xl font-bold mb-2">
          REGISTRATION CERTIFICATE (RC)
        </div>
        <div className="text-sm opacity-90">
          Motor Vehicles Act, 1988
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex border-b pb-2">
            <span className="font-semibold w-1/3">1. Registration Number:</span>
            <span className="font-mono text-lg">{rcData.vehicleNumber || 'N/A'}</span>
          </div>
          
          <div className="flex border-b pb-2">
            <span className="font-semibold w-1/3">2. Owner Name:</span>
            <span>{rcData.ownerName || 'N/A'}</span>
          </div>
          
          <div className="flex border-b pb-2">
            <span className="font-semibold w-1/3">3. Vehicle Class:</span>
            <span>{rcData.vehicleClass || 'N/A'}</span>
          </div>
          
          <div className="flex border-b pb-2">
            <span className="font-semibold w-1/3">4. Fuel Type:</span>
            <span>{rcData.fuelType || 'N/A'}</span>
          </div>
          
          <div className="flex border-b pb-2">
            <span className="font-semibold w-1/3">5. Chassis Number:</span>
            <span className="font-mono">{rcData.chassisNumber || 'N/A'}</span>
          </div>
          
          <div className="flex border-b pb-2">
            <span className="font-semibold w-1/3">6. Engine Number:</span>
            <span className="font-mono">{rcData.engineNumber || 'N/A'}</span>
          </div>
          
          <div className="flex border-b pb-2">
            <span className="font-semibold w-1/3">7. Manufacturer:</span>
            <span>{rcData.manufacturer || 'N/A'}</span>
          </div>
          
          <div className="flex border-b pb-2">
            <span className="font-semibold w-1/3">8. Model:</span>
            <span>{rcData.model || 'N/A'}</span>
          </div>
          
          <div className="flex border-b pb-2">
            <span className="font-semibold w-1/3">9. Registration Date:</span>
            <span>{formatDate(rcData.registrationDate || '')}</span>
          </div>
          
          <div className="flex border-b pb-2">
            <span className="font-semibold w-1/3">10. Insurance Valid Till:</span>
            <span>{formatDate(rcData.insuranceValidTill || '')}</span>
          </div>
          
          <div className="flex border-b pb-2">
            <span className="font-semibold w-1/3">11. RTO Office:</span>
            <span>{rcData.rtoOffice || 'N/A'}</span>
          </div>
          
          <div className="flex border-b pb-2">
            <span className="font-semibold w-1/3">12. Address of Owner:</span>
            <span className="break-words">{rcData.ownerAddress || 'N/A'}</span>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t text-center">
          <div className="text-sm text-muted-foreground mb-2">
            _____________________________________________________
          </div>
          <div className="text-sm italic">
            Signature of Registering Authority
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            (TAMIL NADU STATE TRANSPORT DEPARTMENT)
          </div>
        </div>
        
        <div className="flex gap-3 pt-6">
          <Button 
            onClick={generatePDF}
            className="flex-1 bg-[image:var(--gradient-accent)] hover:shadow-[var(--shadow-glow)] transition-all duration-300 transform hover:scale-105 text-white border-0 h-12 text-base font-semibold"
          >
            <Download className="mr-2 h-5 w-5" />
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RCTemplate;