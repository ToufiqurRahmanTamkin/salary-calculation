let currentCalculation = {};

document.addEventListener("keydown", e => {
  if (e.key === "Enter") calculate();
  if (e.key === "Escape") resetForm();
});

function calculate() {
  const monthly = parseFloat(document.getElementById("monthlySalary").value) || 0;
  const otDays = parseFloat(document.getElementById("dailyOTDays").value) || 0;
  const holidayOTDays = parseFloat(document.getElementById("holidayDays").value) || 0;
  const leaveDays = parseFloat(document.getElementById("leaveDays").value) || 0;

  if (!monthly) {
    alert("❌ Please enter monthly salary");
    return;
  }

  // Calculations
  const daily = monthly / 30;
  const hourly = daily / 8;
  const dailyOTPay = hourly * 2 * 2; // 2 hours × 2x rate
  const totalOT = dailyOTPay * otDays;
  const totalHolidayOT = daily * 2 * holidayOTDays;
  const excessLeave = Math.max(0, leaveDays - 3);
  const leaveDeduction = excessLeave * daily;
  const grandTotalValue = monthly + totalOT + totalHolidayOT - leaveDeduction;

  // Store calculation data
  currentCalculation = {
    monthly,
    daily: daily.toFixed(2),
    hourly: hourly.toFixed(2),
    totalOT: totalOT.toFixed(2),
    totalHolidayOT: totalHolidayOT.toFixed(2),
    leaveDeduction: leaveDeduction.toFixed(2),
    excessLeave,
    grandTotal: grandTotalValue.toFixed(2),
    otDays,
    holidayOTDays,
    leaveDays
  };

  // Update UI (same as before)
  document.getElementById("placeholder").classList.add("hidden");
  document.getElementById("result").classList.remove("hidden");

  document.getElementById("dailySalary").innerText = `${daily.toFixed(2)}`;
  document.getElementById("hourlySalary").innerText = `${hourly.toFixed(2)}`;
  document.getElementById("baseSalaryBreak").innerText = `${monthly.toFixed(2)}`;

  if (otDays > 0) {
    document.getElementById("otRow").style.display = "flex";
    document.getElementById("totalOtBreak").innerText = `+  ${totalOT.toFixed(2)}`;
  } else {
    document.getElementById("otRow").style.display = "none";
  }

  document.getElementById("holidayOtBreak").innerText = `+  ${totalHolidayOT.toFixed(2)}`;

  if (leaveDeduction > 0) {
    document.getElementById("deductionRow").style.display = "flex";
    document.getElementById("noDeductionRow").style.display = "none";
    document.getElementById("leaveDeductionBreak").innerText = `-  ${leaveDeduction.toFixed(2)} (${excessLeave} day${excessLeave > 1 ? 's' : ''})`;
  } else {
    document.getElementById("deductionRow").style.display = "none";
    document.getElementById("noDeductionRow").style.display = "flex";
  }

  document.getElementById("grandTotal").innerText = `${grandTotalValue.toFixed(2)}`;
  
  document.getElementById("exportBtn").classList.remove("hidden");
}

function resetForm() {
  document.querySelectorAll("input").forEach(i => i.value = "");
  document.getElementById("result").classList.add("hidden");
  document.getElementById("placeholder").classList.remove("hidden");
  document.getElementById("exportBtn").classList.add("hidden");
  currentCalculation = {};
}

async function exportInvoice() {
  if (!Object.keys(currentCalculation).length) {
    alert("⚠️ Please calculate first");
    return;
  }

  const employeeName = prompt("Enter employee name for invoice:");
  if (!employeeName) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  const primary = [15, 23, 42];      // dark navy
  const accent = [0, 122, 255];      // blue
  const success = [0, 180, 80];      // green
  const danger  = [220, 53, 69];     // red
  const gray    = [105, 112, 121];
  const text    = [33, 37, 41];

  const nf = v => Number(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // HEADER BAR
  doc.setFillColor(...primary);
  doc.rect(0, 0, 210, 32, "F");

  // Company logo (left)
  try {
    doc.addImage(
      "https://media.licdn.com/dms/image/v2/C4D0BAQFRqB7VmCSbiA/company-logo_200_200/company-logo_200_200/0/1631368475046/nextlevelmedia1_logo?e=1768435200&v=beta&t=9nlnP14c1QagrGuIcatITADNYJ0N-EGZl07B2KosGcc",
      "PNG",
      15,
      6,
      20,
      20
    );
  } catch (_) {}

  // Company text
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Next Level Bangladesh", 40, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("3rd Floor, 644, Golden Plaza,", 40, 19);
  doc.text("3 Bashar Rd, Rajshahi 6100", 40, 24);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PAYROLL INVOICE", 195, 13, { align: "right" });

  // EMPLOYEE BLOCK
  let y = 42;
  doc.setDrawColor(230, 230, 230);
  doc.rect(15, y - 10, 180, 26);

  doc.setTextColor(...text);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Employee Details", 20, y - 3);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...gray);

  const monthLabel = new Date().toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long"
  });
  const invoiceId = `PLL-${Date.now().toString().slice(-6)}`;

  doc.text(`Name: ${employeeName}`, 20, y + 3);
  doc.text(`Month: ${monthLabel}`, 20, y + 9);
  doc.text(`Invoice #: ${invoiceId}`, 115, y + 3);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-GB")}`,
    115,
    y + 9
  );

  // EARNINGS
  y += 26;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accent);
  doc.text("EARNINGS", 15, y);

  y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.line(15, y, 195, y);

  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...text);

  const earningsRows = [];
  earningsRows.push(["Base Salary", `${nf(currentCalculation.monthly)}`]);
  if (currentCalculation.otDays > 0) {
    earningsRows.push([
      `Daily OT (${currentCalculation.otDays} days)`,
      `+ ${nf(currentCalculation.totalOT)}`
    ]);
  }
  earningsRows.push([
    `Holiday OT (${currentCalculation.holidayOTDays} days)`,
    `+ ${nf(currentCalculation.totalHolidayOT)}`
  ]);

  earningsRows.forEach(row => {
    doc.text(row[0], 20, y);
    doc.text(row[1], 190, y, { align: "right" });
    y += 7;
  });

  const totalEarnings =
    Number(currentCalculation.monthly) +
    Number(currentCalculation.totalOT) +
    Number(currentCalculation.totalHolidayOT);

  y += 3;
  doc.setDrawColor(210, 210, 210);
  doc.line(20, y, 190, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...success);
  doc.text("Total Earnings", 20, y);
  doc.text(`${nf(totalEarnings)}`, 190, y, { align: "right" });

  // DEDUCTIONS
  y += 15;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...danger);
  doc.text("DEDUCTIONS", 15, y);

  y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.line(15, y, 195, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...text);

  const leaveDed = Number(currentCalculation.leaveDeduction);
  if (leaveDed > 0) {
    doc.text(
      `Leave (${currentCalculation.excessLeave} days)`,
      20,
      y
    );
    doc.text(`- ${nf(leaveDed)}`, 190, y, { align: "right" });
    y += 7;
  } else {
    doc.setTextColor(...gray);
    doc.text("No deductions applied", 20, y);
    y += 7;
  }

  // NET PAYABLE
  const net = Number(currentCalculation.grandTotal);

  y += 15;
  doc.setFillColor(240, 248, 255);
  doc.setDrawColor(...accent);
  doc.rect(15, y, 180, 28, "FD");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accent);
  doc.text("NET PAYABLE AMOUNT", 20, y + 9);

  doc.setFontSize(18);
  doc.setTextColor(...text);
  doc.text(`${nf(net)}`, 190, y + 18, { align: "right" });

  // FOOTER
  const footerY = 280;
  doc.setDrawColor(235, 235, 235);
  doc.line(15, footerY - 4, 195, footerY - 4);

  doc.setFontSize(8);
  doc.setTextColor(...gray);

  try {
    doc.addImage(
      "https://mymanager.com/assets/blacklogo-7f38aa0d.png",
      "PNG",
      15,
      footerY - 3,
      14,
      6
    );
  } catch (_) {}

  doc.text("Powered by Mymanager", 32, footerY + 1);
  doc.text(
    "This is a computer-generated payroll invoice.",
    195,
    footerY + 1,
    { align: "right" }
  );

  const filename = `NextLevel_Payroll_${employeeName
    .replace(/[^a-zA-Z0-9]/g, "_")}_${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;
  doc.save(filename);
}

