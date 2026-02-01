import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportPdfOptions {
  title: string;
  period: {
    startDate: string;
    endDate: string;
  };
  data: {
    revenue: Array<{ date: string; totalAmount: number }>;
    appointments: Array<{ date: string; totalAppointments: number }>;
  };
}

export async function exportToPdf(options: ExportPdfOptions): Promise<void> {
  const { title, period, data } = options;

  // 建立 PDF 文件（A4 尺寸）
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // 標題
  pdf.setFontSize(20);
  pdf.text(title, pageWidth / 2, 20, { align: 'center' });

  // 日期範圍
  pdf.setFontSize(12);
  pdf.text(
    `統計期間：${period.startDate} ~ ${period.endDate}`,
    pageWidth / 2,
    30,
    { align: 'center' }
  );

  // 營收數據表格
  pdf.setFontSize(14);
  pdf.text('營收數據', 20, 45);

  pdf.setFontSize(10);
  let yPosition = 55;
  pdf.text('日期', 20, yPosition);
  pdf.text('總營收(元)', 80, yPosition);

  yPosition += 5;
  pdf.line(20, yPosition, pageWidth - 20, yPosition);

  yPosition += 5;
  data.revenue.forEach((row) => {
    if (yPosition > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.text(row.date, 20, yPosition);
    pdf.text(row.totalAmount.toLocaleString(), 80, yPosition);
    yPosition += 7;
  });

  // 預約數據表格
  pdf.addPage();
  yPosition = 20;
  pdf.setFontSize(14);
  pdf.text('預約數據', 20, yPosition);

  yPosition += 10;
  pdf.setFontSize(10);
  pdf.text('日期', 20, yPosition);
  pdf.text('總預約數', 80, yPosition);

  yPosition += 5;
  pdf.line(20, yPosition, pageWidth - 20, yPosition);

  yPosition += 5;
  data.appointments.forEach((row) => {
    if (yPosition > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.text(row.date, 20, yPosition);
    pdf.text(row.totalAppointments.toString(), 80, yPosition);
    yPosition += 7;
  });

  // 下載 PDF
  pdf.save(`${title}_${period.startDate}_${period.endDate}.pdf`);
}

export async function exportChartToPdf(
  chartElementId: string,
  filename: string
): Promise<void> {
  const chartElement = document.getElementById(chartElementId);
  if (!chartElement) {
    throw new Error(`Chart element with id "${chartElementId}" not found`);
  }

  // 使用 html2canvas 將圖表轉換為圖片
  const canvas = await html2canvas(chartElement, {
    scale: 2, // 提高解析度
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');

  // 建立 PDF 並嵌入圖片
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth - 40; // 左右各留 20mm 邊距
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
  pdf.save(filename);
}
