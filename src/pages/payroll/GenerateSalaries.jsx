import React, { useState } from 'react';
import * as XLSX from "xlsx";
import axios from 'axios';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import useScreenSize from "../../assets/components/useScreenSize";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const GenerateSalaries = () => {
    const [payrollData, setPayrollData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const isMediumScreen = useScreenSize(768);
    const [filters, setFilters] = useState({
        date_from: '',
        date_to: '',
        branch: 'Main',
        employee_type: 'monthly',
    });
    const [searchTerm, setSearchTerm] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value,
        });
    };

     const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2,
        }).format(amount);
    };


    const formatDateRange = (dateFrom, dateTo) => {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);

        const options = { month: 'long', day: 'numeric' };
        const formattedFrom = new Intl.DateTimeFormat('en-US', options).format(from);

        const isDifferentMonth = from.getMonth() !== to.getMonth();

        const toOptions = isDifferentMonth ? { month: 'long', day: 'numeric' } : { day: 'numeric' };
        const formattedTo = new Intl.DateTimeFormat('en-US', toOptions).format(to);

        const year = to.getFullYear();

        return `${formattedFrom} - ${formattedTo}, ${year}`;
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const fetchPayrollData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/payroll/filter', { params: filters });
            setPayrollData(response.data);
        } catch (error) {
            console.error('Error fetching payroll data', error);
        }
    };

    const filteredData = payrollData.filter((payroll) => {
        const lowercasedSearchTerm = searchTerm.toLowerCase();
        return (
            payroll.employee_name.toLowerCase().includes(lowercasedSearchTerm) ||
            payroll.branch.toLowerCase().includes(lowercasedSearchTerm) ||
            payroll.employee_type.toLowerCase().includes(lowercasedSearchTerm)
        );
    });



    const [LoanData, setLoanData] = useState({});

    const calculateAllLoans = async () => {
        try {
            const calculatedData = await Promise.all(
                payrollData.map(async (payroll) => {
                    try {
                        const response = await axios.post('http://127.0.0.1:8000/api/payroll/calculate-loans', 
                            { id: payroll.id }, 
                            { headers: { 'Content-Type': 'application/json' } }
                        );
                        return { id: payroll.id, loans: response.data.loans };
                    } catch (error) {
                        console.error(`Error calculating loan for payroll ID ${payroll.id}:`, error.response?.data || error.message);
                        return { id: payroll.id, loans: null };
                    }
                })
            );
    
            const LoanMap = {};
            calculatedData.forEach((item) => {
                if (item.loans) {
                    LoanMap[item.id] = item.loans;
                }
            });
    
            setLoanData(LoanMap);
        } catch (error) {
            console.error('Error calculating all loan values:', error.message);
        }
    };
    


    const saveAllLoans = async () => {
        try {
            await axios.post(
                'http://127.0.0.1:8000/api/payroll/save-all-loans', 
                { LoanData }, 
                { headers: { 'Content-Type': 'application/json' } }
            );
            alert('All loan values saved successfully');
        } catch (error) {
            console.error('Error saving all loan values', error.response?.data || error.message);
        }
    };

    const handleRowSelect = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    };
    
    const handleSelectAll = () => {
        if (selectedRows.length === filteredData.length) {
            setSelectedRows([]); 
        } else {
            setSelectedRows(filteredData.map((payroll) => payroll.id)); 
        }
    };
    
    const handlePrint = () => {
        const selectedData = payrollData.filter((payroll) => selectedRows.includes(payroll.id));
    
        const LABEL_WIDTH = 20;
        const VALUE_WIDTH = 25; 
    
        const padRight = (text, width) => text.padEnd(width, ' ');
        const padLeft = (text, width) => text.padStart(width, ' ');
    
        const chunks = [];
        for (let i = 0; i < selectedData.length; i += 4) {
            chunks.push(selectedData.slice(i, i + 4));
        }
    
        const printableContent = chunks.map((chunk, index) =>
            chunk
                .map((data) => {
                    const getFloat = (value) => parseFloat(value) || 0;

                    const SSS_EE = getFloat(data.SSS_EE);
                    const sss_lrp = getFloat(data.sss_lrp_amount);
                    const sss_cal = getFloat(data.sss_calamity_amount);
                    const sss_loan_amount = getFloat(data.sss_loan_amount);
                    
                    const pag_ibig_prem = getFloat(data.pag_ibig_prem);
                    const PHIP_PREMIUM = getFloat(data.PHIP_PREMIUM);
                    const mp2 = getFloat(data.mp2_amount);
                    const hdmf_loan = getFloat(data.hdmf_loan_amount);

                    const cash_loan_amount = getFloat(data.cash_loan_amount);
                    const cash_loan = getFloat(data.cash_loan);
                    const cash_bond = getFloat(data.cash_bond_amount);
                    const emp_liab_amount = getFloat(data.emp_liab_amount);
                    const health_card = getFloat(data.health_card);
                    const calamity = getFloat(data.calamity_amount);

                    const canteen = getFloat(data.canteen);
                    const gross_pay = getFloat(data.gross_pay);
                    
                    // Calculate total deductions
                    const totalDeductions = SSS_EE + pag_ibig_prem + PHIP_PREMIUM + canteen + cash_loan_amount + sss_lrp + sss_cal + sss_loan_amount + calamity + hdmf_loan + cash_bond + emp_liab_amount + health_card + mp2;
                    const totalNetPay = gross_pay - totalDeductions;
                    const total_cash_loan_balance = cash_loan_amount - cash_loan;
                    
    
                    return `
            ${padRight('Employee Code:', LABEL_WIDTH)}${padRight(
                                String(data.masterlist_id).padStart(4, '0'),
                                VALUE_WIDTH
                            )}${padRight('', LABEL_WIDTH)}${padRight(String(''), VALUE_WIDTH)}
            ${padRight('Employee Name:', LABEL_WIDTH)}${padRight(data.employee_name, VALUE_WIDTH)}${padRight(
                                'Payroll Date:',    
                                LABEL_WIDTH
                            )}${padRight(new Date(data.created_at).toLocaleDateString(), VALUE_WIDTH)}
            ${padRight('Branch/Department:', LABEL_WIDTH)}${padRight(
                                data.branch,
                                VALUE_WIDTH
                            )}${padRight('Payroll Period:', LABEL_WIDTH)}${padRight(
                                formatDateRange(data.date_from, data.date_to),
                                VALUE_WIDTH
                            )}
            
            ${padRight('Regular pay:', LABEL_WIDTH)}${padRight(formatCurrency(data.regular_pay), VALUE_WIDTH)}${padRight(
                                'SSS premium:',
                                LABEL_WIDTH
                            )}${padRight(formatCurrency(data.SSS_EE || 0), VALUE_WIDTH)}
            ${padRight('Overtime pay:', LABEL_WIDTH)}${padRight(formatCurrency(data.reg_overtime_pay), VALUE_WIDTH)}${padRight(
                                'PHIP premium:',
                                LABEL_WIDTH
                            )}${padRight(formatCurrency(data.PHIP_PREMIUM || 0), VALUE_WIDTH)}
            ${padRight('Sp hol pay:', LABEL_WIDTH)}${padRight(formatCurrency(data.sp_holiday_pay), VALUE_WIDTH)}${padRight(
                                'With holding tax:',
                                LABEL_WIDTH
                            )}${padRight(formatCurrency(data.tax || 0), VALUE_WIDTH)}
            ${padRight('Holiday pay:', LABEL_WIDTH)}${padRight(formatCurrency(data.reg_holiday_pay), VALUE_WIDTH)}${padRight(
                                'Pag-ibig prem:',
                                LABEL_WIDTH
                            )}${padRight(formatCurrency(data.pag_ibig_prem || 0), VALUE_WIDTH)}
            ${padRight('Restday pay:', LABEL_WIDTH)}${padRight(formatCurrency(data.restday_pay), VALUE_WIDTH)}${padRight(
                                'Cash Loan/C Bond:',
                                LABEL_WIDTH
                            )}${padRight(
                                `${formatCurrency(cash_loan_amount || 0)} (${formatCurrency(total_cash_loan_balance || 0)})`,
                                VALUE_WIDTH
                            )}${padRight(formatCurrency(data.cash_bond_amount || 0), LABEL_WIDTH)}
            ${padRight('Night prem:', LABEL_WIDTH)}${padRight(formatCurrency(data.night_diff_pay), VALUE_WIDTH)}${padRight(
                                'SSS Loan/MP2:',
                                LABEL_WIDTH
                            )}${padRight(formatCurrency(data.sss_loan_amount || 0), VALUE_WIDTH)}${padRight(formatCurrency(data.mp2_amount || 0), LABEL_WIDTH)}
            ${padRight('Leave w/ pay:', LABEL_WIDTH)}${padRight(formatCurrency(data.leave_with_pay), VALUE_WIDTH)}${padRight(
                                'Emp Liab/H Card:',
                                LABEL_WIDTH
                            )}${padRight(formatCurrency(data.emp_liab_amount || 0), VALUE_WIDTH)}${padRight(formatCurrency(data.health_card || 0), LABEL_WIDTH)}
            ${padRight('Cola:', LABEL_WIDTH)}${padRight(formatCurrency(data.cola_pay), VALUE_WIDTH)}${padRight(
                                'SSS Cal/SSS Lrp:',
                                LABEL_WIDTH
                            )}${padRight(formatCurrency(data.sss_calamity_amount || 0), VALUE_WIDTH)}${padRight(formatCurrency(data.sss_lrp_amount || 0), LABEL_WIDTH)}
            ${padRight('Other Income:', LABEL_WIDTH)}${padRight(formatCurrency(data.other_income), VALUE_WIDTH)}${padRight(
                                'HDMF Loan/Cal:',
                                LABEL_WIDTH
                            )}${padRight(formatCurrency(data.hdmf_loan_amount || 0), VALUE_WIDTH)}${padRight(formatCurrency(data.phip_premium || 0), LABEL_WIDTH)}
            ${padRight('Gross Pay:', LABEL_WIDTH)}${padRight(formatCurrency(data.gross_pay), VALUE_WIDTH)}${padRight(
                                'Cash Advance:',
                                LABEL_WIDTH
                            )}${padRight(formatCurrency(data.cash_advance || 0), VALUE_WIDTH)}
            ${padRight('', LABEL_WIDTH)}${padRight('', VALUE_WIDTH)}${padRight('Canteen:', LABEL_WIDTH)}${padRight(
                                formatCurrency(data.canteen || 0),
                                VALUE_WIDTH
                            )}
            
            ${padRight('NET PAY:', LABEL_WIDTH)}${padRight(formatCurrency(totalNetPay), VALUE_WIDTH)}${padRight(
                                'TOTAL DEDUCTION:',
                                LABEL_WIDTH
                            )}${padRight(formatCurrency(totalDeductions), VALUE_WIDTH)}${padRight('__________________', LABEL_WIDTH)}
            ${'-'.repeat(80)}
                    `;
                })
                .join('\n') + (index < chunks.length - 1 ? '<div style="page-break-after: always;"></div>' : '')
        ).join('');
    
        const printWindow = window.open('', 'Payslip');
        printWindow.document.write(`
            <html>
            <head>
                <title>Payslip</title>
                <style>
                    body {
                        font-family: monospace;
                        font-size: 13px;
                        margin: 0;
                        padding: 0;
                        width: 9.5in;
                        height: 11in;
                    }
                    pre {
                        white-space: pre-wrap;
                        word-wrap: break-word;
                    }
                </style>
            </head>
            <body>
                <pre>${printableContent}</pre>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };
    
    
    const handlePrintReceiving = () => {
        const selectedData = payrollData.filter((payroll) => selectedRows.includes(payroll.id));
    
        if (!selectedData.length) return;
    
        const payrollPeriod = formatDateRange(selectedData[0].date_from, selectedData[0].date_to);
    
        const headers = [
            { label: 'Emp Code', width: 15 },
            { label: 'Fullname', width: 25 },
            { label: 'Net Pay', width: 20 },
            { label: 'Signature', width: 20 },
        ];
    
        const padText = (text, width) => text.toString().padEnd(width, ' ');
    
        const headerRow = `Payroll Period: ${payrollPeriod}\n\n` + headers.map(h => padText(h.label, h.width)).join('');
        const separator = '-'.repeat(headers.reduce((sum, h) => sum + h.width, 0));
    
        const rows = selectedData.map(data => {
            const totalDeductions = [
                'SSS_EE', 'pag_ibig_prem', 'PHIP_PREMIUM', 'canteen', 'cash_loan_amount', 
                'sss_lrp_amount', 'sss_calamity_amount', 'sss_loan_amount', 'calamity_amount', 'hdmf_loan_amount', 
                'cash_bond_amount', 'emp_liab_amount', 'health_card', 'mp2_amount'
            ].reduce((sum, key) => sum + (parseFloat(data[key]) || 0), 0);
    
            const netPay = formatCurrency((parseFloat(data.gross_pay) || 0) - totalDeductions);
    
            return [
                String(data.masterlist_id).padStart(4, '0'),
                `${data.last_name}, ${data.first_name}`,
                netPay,
                '____________________'
            ].map((text, i) => padText(text, headers[i].width)).join('');
        });
    
        // Combine content and print
        const printableContent = [headerRow, separator, ...rows].join('\n');
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<pre style="font-family: monospace; font-size: 25px;">${printableContent}</pre>`);
        printWindow.document.close();
        printWindow.print();
    };



const handleExportPDF = (selectedRows, filteredData) => {
    try {
      if (!filteredData || filteredData.length === 0) {
        console.warn("No data available to export");
        return;
      }
  
      if (!selectedRows || selectedRows.length === 0) {
        console.warn("No rows selected for export");
        return;
      }
  
      const formatCurrency = (value) => {
        return Number(value || 0).toLocaleString('en-PH', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      };
  
      const selectedData = filteredData.filter((payroll) =>
        selectedRows.includes(payroll.id)
      );
  
      if (selectedData.length === 0) {
        console.warn("No matching data found for selected rows");
        return;
      }
  
      const firstRecord = selectedData[0];
      const branchName = firstRecord?.branch || 'Unknown';
      const dateFrom = firstRecord?.date_from || '';
      const dateTo = firstRecord?.date_to || '';
  
      const deductions = [
        'canteen', 'calamity_amount', 'hdmf_loan_amount', 'health_card', 'emp_liab_amount',
        'cash_bond_amount', 'cash_loan_amount', 'pag_ibig_prem', 'mp2_amount', 'PHIP_PREMIUM',
        'sss_lrp_amount', 'sss_calamity_amount', 'sss_loan_amount', 'SSS_EE',
      ];
  
      // non-zero data
      const hasSpHolidayData = selectedData.some(data =>
        Math.abs(parseFloat(data.worked_sp_holiday) || 0) > 0.001 ||
        Math.abs(parseFloat(data.sp_holiday_pay) || 0) > 0.001 ||
        Math.abs(parseFloat(data.sp_holiday_ot) || 0) > 0.001 ||
        Math.abs(parseFloat(data.sp_holiday_ot_pay) || 0) > 0.001
      );
  
      const hasRegHolidayData = selectedData.some(data =>
        Math.abs(parseFloat(data.worked_reg_holiday) || 0) > 0.001 ||
        Math.abs(parseFloat(data.reg_holiday_pay) || 0) > 0.001 ||
        Math.abs(parseFloat(data.reg_holiday_ot) || 0) > 0.001 ||
        Math.abs(parseFloat(data.reg_holiday_ot_pay) || 0) > 0.001
      );

      const hasRestDayData = selectedData.some(data =>
        Math.abs(parseFloat(data.worked_restday) || 0) > 0.001 ||
        Math.abs(parseFloat(data.restday_pay) || 0) > 0.001 ||
        Math.abs(parseFloat(data.restday_ot) || 0) > 0.001 ||
        Math.abs(parseFloat(data.restday_ot_pay) || 0) > 0.001
      );
  
      let processedData = [];
      try {
        processedData = selectedData.map((data) => {
          const totalDeductions = deductions.reduce((sum, key) => {
            return sum + (parseFloat(data[key]) || 0);
          }, 0);
  
          const adjustedNetPay = (parseFloat(data.gross_pay) || 0) - totalDeductions;
  
          const employeeName = [
            data.last_name || '',
            data.first_name || '',
            data.middle_name || ''
          ].filter(Boolean).join(', ');
  
          const basicPay = (data.basic_pay);
          const lateUnderTime = (data.late);
          const cola = (data.cola);
          const equivtBasic = basicPay / 8 * lateUnderTime;
          const equivtCola = cola / 8 * lateUnderTime;
  
          let values = [
            parseFloat(data.basic_pay) || 0,
            parseFloat(data.cola) || 0,
            parseFloat(data.total_working_hrs) || 0,
            parseFloat(data.late) || 0,
            parseFloat(data.regular_pay) || 0,
            parseFloat(data.cola_pay) || 0,
            parseFloat(data.total_no_ot) || 0,
            parseFloat(data.reg_overtime_pay) || 0,
          ];
  
          if (hasSpHolidayData) {
            values.push(
              parseFloat(data.worked_sp_holiday) || 0,
              parseFloat(data.sp_holiday_pay) || 0,
              parseFloat(data.sp_holiday_ot) || 0,
              parseFloat(data.sp_holiday_ot_pay) || 0,
            );
          }
  
          if (hasRegHolidayData) {
            values.push(
              parseFloat(data.worked_reg_holiday) || 0,
              parseFloat(data.reg_holiday_pay) || 0,
              parseFloat(data.reg_holiday_ot) || 0,
              parseFloat(data.reg_holiday_ot_pay) || 0,
            );
          }

          if (hasRestDayData) {
            values.push(
              parseFloat(data.worked_restday) || 0,
              parseFloat(data.restday_pay) || 0,
              parseFloat(data.restday_ot) || 0,
              parseFloat(data.restday_ot_pay) || 0,
            );
          }

          values.push(
            parseFloat(data.leave) || 0,
            parseFloat(data.leave_with_pay) || 0,
            parseFloat(equivtBasic) || 0,
            parseFloat(equivtCola) || 0,
            parseFloat(data.gross_pay) || 0,
            parseFloat(data.pag_ibig_prem) || 0,
            parseFloat(data.sss_loan_amount) || 0,
            parseFloat(data.hdmf_loan_amount) || 0,
            parseFloat(data.cash_loan_amount) || 0,
            totalDeductions,
            adjustedNetPay
          );
  
          return {
            name: employeeName,
            values: values
          };
        });
      } catch (e) {
        console.error("Error processing data:", e);
        throw new Error("Failed to process payroll data");
      }
  
      const filteredRows = processedData.filter(row => {
        return row.values.some(value => Math.abs(value) > 0.001);
      });
  
      if (filteredRows.length === 0) {
        alert("No data to export - all selected rows have zero values");
        return;
      }
  
      const tableData = filteredRows.map(row => [row.name, ...row.values]);
  
      const grandTotals = new Array(tableData[0].length).fill(0);
      tableData.forEach(row => {
        row.forEach((cell, index) => {
          if (index > 0) {
            grandTotals[index] += parseFloat(cell) || 0;
          }
        });
      });
  
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm"
      });
  
      const pageWidth = 297;
      const printableWidth = pageWidth - (6.35 * 2);
      const leftMargin = 6.35;
  
      doc.setFontSize(13);
      const titleText = `SOUTH SEAS CARGO FORWARDERS, INC - ${branchName.toUpperCase()} BRANCH`;
      const titleWidth = doc.getTextWidth(titleText);
      doc.text(titleText, leftMargin + (printableWidth - titleWidth) / 2, 15);
  
      const formatDateRange = (start, end) => {
        try {
          const startDate = new Date(start);
          const endDate = new Date(end);
          const options = { month: 'long' };
          const startMonth = startDate.toLocaleDateString('en-US', options);
          const endMonth = endDate.toLocaleDateString('en-US', options);
          const startDay = startDate.getDate();
          const endDay = endDate.getDate();
          const year = endDate.getFullYear();
  
          return startMonth === endMonth
            ? `${startMonth} ${startDay} - ${endDay}, ${year}`
            : `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
        } catch (e) {
          console.error("Error formatting date:", e);
          return "Invalid date range";
        }
      };
  
      doc.setFontSize(11);
      const dateText = formatDateRange(dateFrom, dateTo);
      const dateWidth = doc.getTextWidth(dateText);
      doc.text(dateText, leftMargin + (printableWidth - dateWidth) / 2, 23);
  
      const mainHeaders = [
        { content: "EMPLOYEE NAME", rowSpan: 2 },
        { content: "DAILY RATE", colSpan: 2 },
        { content: "WORKING HRS", colSpan: 2 },
        { content: "REGULAR PAY", rowSpan: 2 },
        { content: "COLA", rowSpan: 2 },
        { content: "OVERTIME", colSpan: 2 },
        ...(hasSpHolidayData ? [{ content: "SP HOLIDAY", colSpan: 4 }] : []),
        ...(hasRegHolidayData ? [{ content: "REG HOLIDAY", colSpan: 4 }] : []),
        ...(hasRestDayData ? [{ content: "REST DAY", colSpan: 4 }] : []),
        { content: "LEAVE WITH PAY", colSpan: 2 },
        { content: "EQUIV'T LATES", colSpan: 2 },
        { content: "GROSS PAY", rowSpan: 2 },
        { content: "DEDUCTIONS", colSpan: 4 },
        { content: "TOTAL DEDUCTIONS", rowSpan: 2 },
        { content: "TOTAL NET PAY", rowSpan: 2 },
      ];
  
      const subHeaders = [
        "BASIC", "COLA",
        "# OF HRS", "LATES/UNDER TIME",
        "# OF HRS", "OT PAY",
        ...(hasSpHolidayData ? ["# OF HRS", "SP HOL PAY", "OT HRS", "OT RATES"] : []),
        ...(hasRegHolidayData ? ["# OF HRS", "REG HOL PAY", "OT HRS", "OT RATES"] : []),
        ...(hasRestDayData ? ["# OF HRS", "PAY RATES", "OT HRS", "OT RATES"] : []),
        "# OF DAYS", "PAY RATE",
        "BASIC", "COLA",
        "HDMF", "SSS SALARY LOAN", "HDMF SAL LOAN", "CASH ADVANCES"
      ];
  
      autoTable(doc, {
        startY: 30,
        margin: {
          left: leftMargin,
          right: leftMargin,
          top: 30
        },
        tableWidth: printableWidth,
        head: [mainHeaders, subHeaders],
        body: [
          ...tableData.map(row =>
            row.map((cell, index) => index === 0 ? cell : formatCurrency(cell))
          ),
          [
            {
              content: 'GRAND TOTAL',
              styles: {
                fontStyle: 'bold',
                halign: 'center',
                lineWidth: 0
              }
            },
            ...grandTotals.slice(1).map(total => ({
              content: formatCurrency(total),
              styles: {
                fontStyle: 'bold',
                lineWidth: 0
              }
            })),
          ],
        ],
        styles: {
          fontSize: 7,
          cellPadding: 1,
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
          valign: 'middle',
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [22, 54, 92],
          textColor: 255,
          halign: 'center',
          valign: 'middle',
          fontSize: 6,
        },
        bodyStyles: {
          valign: 'middle',
          halign: 'center',
        },
        columnStyles: {
          0: {
            cellWidth: 25,
            halign: 'left',
          },
        },
        didDrawPage: function (data) {
          if (data.pageCount === data.pageNumber) {
            const table = data.table;
            const lastRow = table.body[table.body.length - 1];
            if (lastRow) {
              const y = lastRow.y + lastRow.height;
              const x = table.settings.margin.left;
              const width = table.width;
              doc.setDrawColor(0);
              doc.setLineWidth(0.5);
              doc.line(x, y, x + width, y);
            }
          }
        }
      });
  
      doc.save(`Payroll_${branchName}_${dateFrom}_to_${dateTo}.pdf`);
  
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("An error occurred while generating the PDF. Please check the console for details.");
    }
  };
  


const handleExportEmployeeRemittance = async (selectedRows, filteredData) => {
    const selectedData = filteredData.filter((payroll) =>
        selectedRows.includes(payroll.id)
    );

    const pagibigERContributions = {};

    const groupedData = selectedData.reduce((acc, data) => {
        const fullName = `${data.last_name}, ${data.first_name} ${data.middle_name || ""}`.trim();
        const grossPay = parseFloat(data.gross_pay) || 0;
        const SSS_EE = parseFloat(data.SSS_EE) || 0;
        const SSS_ER = parseFloat(data.SSS_ER) || 0;
        const totalSssAmount = SSS_EE + SSS_ER;

        const basicPay = parseFloat(data.basic_pay) || 0;
        const PHIC_EE = (basicPay * 0.05) / 2;
        const PHIC_ER = (basicPay * 0.05) / 2;
        const PHIC_TOTAL = PHIC_EE + PHIC_ER;

        const PAGIBIG_EE = parseFloat(data.pag_ibig_prem) || 0;
        const PAGIBIG_ER = 200;

        if (!acc[fullName]) {
            acc[fullName] = {
                "Last Name": data.last_name,
                "First Name": data.first_name,
                "Branch": (data.remittance_branch_code || data.Branch || "").trim().toUpperCase(),
                "Gross Pay": grossPay,
                "SSS EE": SSS_EE,
                "SSS ER": SSS_ER,
                "SSS Total": totalSssAmount,
                "PHIC EE": PHIC_EE,
                "PHIC ER": PHIC_ER,
                "PHIC Total": PHIC_TOTAL,
                "PAG-IBIG EE": PAGIBIG_EE,
                "PAG-IBIG ER": 0,
                "PAG-IBIG Total": PAGIBIG_EE,
                hasPAGIBIG_ER: false,
            };
        } else {
            acc[fullName]["Gross Pay"] += grossPay;
            acc[fullName]["SSS EE"] += SSS_EE;
            acc[fullName]["SSS ER"] += SSS_ER;
            acc[fullName]["SSS Total"] += totalSssAmount;
            acc[fullName]["PHIC EE"] += PHIC_EE;
            acc[fullName]["PHIC ER"] += PHIC_ER;
            acc[fullName]["PHIC Total"] += PHIC_TOTAL;
            acc[fullName]["PAG-IBIG EE"] += PAGIBIG_EE;
            acc[fullName]["PAG-IBIG Total"] = acc[fullName]["PAG-IBIG EE"] + acc[fullName]["PAG-IBIG ER"];
        }

        if (!pagibigERContributions[fullName]) {
            acc[fullName]["PAG-IBIG ER"] += PAGIBIG_ER;
            acc[fullName]["PAG-IBIG Total"] += PAGIBIG_ER;
            pagibigERContributions[fullName] = true;
        }

        return acc;
    }, {});

    const formattedData = Object.values(groupedData).map((entry) => ({
        ...entry,
        "Gross Pay": parseFloat(entry["Gross Pay"].toFixed(2)),
        "SSS EE": parseFloat(entry["SSS EE"].toFixed(2)),
        "SSS ER": parseFloat(entry["SSS ER"].toFixed(2)),
        "SSS Total": parseFloat(entry["SSS Total"].toFixed(2)),
        "PHIC EE": parseFloat(entry["PHIC EE"].toFixed(2)),
        "PHIC ER": parseFloat(entry["PHIC ER"].toFixed(2)),
        "PHIC Total": parseFloat(entry["PHIC Total"].toFixed(2)),
        "PAG-IBIG EE": parseFloat(entry["PAG-IBIG EE"].toFixed(2)),
        "PAG-IBIG ER": parseFloat(entry["PAG-IBIG ER"].toFixed(2)),
        "PAG-IBIG Total": parseFloat(entry["PAG-IBIG Total"].toFixed(2)),
    }));

    const employeeTotal = formattedData.reduce(
        (acc, entry) => {
            acc["Gross Pay"] += entry["Gross Pay"];
            acc["SSS EE"] += entry["SSS EE"];
            acc["SSS ER"] += entry["SSS ER"];
            acc["SSS Total"] += entry["SSS Total"];
            acc["PHIC EE"] += entry["PHIC EE"];
            acc["PHIC ER"] += entry["PHIC ER"];
            acc["PHIC Total"] += entry["PHIC Total"];
            acc["PAG-IBIG EE"] += entry["PAG-IBIG EE"];
            acc["PAG-IBIG ER"] += entry["PAG-IBIG ER"];
            acc["PAG-IBIG Total"] += entry["PAG-IBIG Total"];
            return acc;
        },
        {
            "Gross Pay": 0,
            "SSS EE": 0,
            "SSS ER": 0,
            "SSS Total": 0,
            "PHIC EE": 0,
            "PHIC ER": 0,
            "PHIC Total": 0,
            "PAG-IBIG EE": 0,
            "PAG-IBIG ER": 0,
            "PAG-IBIG Total": 0,
        }
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Employee Remittance");

    worksheet.columns = [
        { header: "Fullname", key: "Fullname", width: 30 },
        { header: "Gross Pay", key: "Gross Pay", width: 15 },
        { header: "SSS EE", key: "SSS EE", width: 10 },
        { header: "SSS ER", key: "SSS ER", width: 10 },
        { header: "SSS Total", key: "SSS Total", width: 15 },
        { header: "PHIC EE", key: "PHIC EE", width: 10 },
        { header: "PHIC ER", key: "PHIC ER", width: 10 },
        { header: "PHIC Total", key: "PHIC Total", width: 15 },
        { header: "PAG-IBIG EE", key: "PAG-IBIG EE", width: 15 },
        { header: "PAG-IBIG ER", key: "PAG-IBIG ER", width: 15 },
        { header: "PAG-IBIG Total", key: "PAG-IBIG Total", width: 15 },
        { header: "Branch", key: "Branch", width: 15 },
    ];

    formattedData.forEach((entry) => {
        const fullName = `${entry["Last Name"]}, ${entry["First Name"]}`;
        worksheet.addRow({
            Fullname: fullName,
            "Gross Pay": entry["Gross Pay"],
            "SSS EE": entry["SSS EE"],
            "SSS ER": entry["SSS ER"],
            "SSS Total": entry["SSS Total"],
            "PHIC EE": entry["PHIC EE"],
            "PHIC ER": entry["PHIC ER"],
            "PHIC Total": entry["PHIC Total"],
            "PAG-IBIG EE": entry["PAG-IBIG EE"],
            "PAG-IBIG ER": entry["PAG-IBIG ER"],
            "PAG-IBIG Total": entry["PAG-IBIG Total"],
            Branch: entry["Branch"],
        });
    });

    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    const employeeTotalRow = worksheet.addRow([
        "EMPLOYEE TOTAL",
        employeeTotal["Gross Pay"].toFixed(2),
        employeeTotal["SSS EE"].toFixed(2),
        employeeTotal["SSS ER"].toFixed(2),
        employeeTotal["SSS Total"].toFixed(2),
        employeeTotal["PHIC EE"].toFixed(2),
        employeeTotal["PHIC ER"].toFixed(2),
        employeeTotal["PHIC Total"].toFixed(2),
        employeeTotal["PAG-IBIG EE"].toFixed(2),
        employeeTotal["PAG-IBIG ER"].toFixed(2),
        employeeTotal["PAG-IBIG Total"].toFixed(2),
        "",
    ]);
    employeeTotalRow.eachCell((cell) => cell.font = { bold: true });

    // Add spacing
    worksheet.addRow([]);
    worksheet.addRow([]);

    const branchPagibigERContributions = {};

    const branchTotals = selectedData.reduce((acc, data) => {
        const branch = (data.remittance_branch_code || data.Branch || "").trim().toUpperCase(); // Standardize
        const grossPay = parseFloat(data.gross_pay) || 0;
        const SSS_EE = parseFloat(data.SSS_EE) || 0;
        const SSS_ER = parseFloat(data.SSS_ER) || 0;
        const totalSssAmount = SSS_EE + SSS_ER;

        // PHIC Calculations
        const basicPay = parseFloat(data.basic_pay) || 0;
        const PHIC_EE = (basicPay * 0.05) / 2; // PHIC EE = basic_pay * 0.05 / 2
        const PHIC_ER = (basicPay * 0.05) / 2; // PHIC ER = basic_pay * 0.05 / 2
        const PHIC_TOTAL = PHIC_EE + PHIC_ER;

        // PAG-IBIG Calculations
        const PAGIBIG_EE = parseFloat(data.pag_ibig_prem) || 0;
        const PAGIBIG_ER = 200;
        const PAGIBIG_TOTAL = PAGIBIG_EE + PAGIBIG_ER;

        if (!acc[branch]) {
            acc[branch] = {
                "Gross Pay": 0,
                "SSS EE": 0,
                "SSS ER": 0,
                "SSS Total": 0,
                "PHIC EE": 0,
                "PHIC ER": 0,
                "PHIC Total": 0,
                "PAG-IBIG EE": 0,
                "PAG-IBIG ER": 0,
                "PAG-IBIG Total": 0,
            };
        }
        acc[branch]["Gross Pay"] += grossPay;
        acc[branch]["SSS EE"] += SSS_EE;
        acc[branch]["SSS ER"] += SSS_ER;
        acc[branch]["SSS Total"] += totalSssAmount;
        acc[branch]["PHIC EE"] += PHIC_EE;
        acc[branch]["PHIC ER"] += PHIC_ER;
        acc[branch]["PHIC Total"] += PHIC_TOTAL;
        acc[branch]["PAG-IBIG EE"] += PAGIBIG_EE;

        const fullName = `${data.last_name}, ${data.first_name} ${data.middle_name || ""}`.trim();
        if (!branchPagibigERContributions[`${branch}-${fullName}`]) {
            acc[branch]["PAG-IBIG ER"] += PAGIBIG_ER;
            branchPagibigERContributions[`${branch}-${fullName}`] = true;
        }

        acc[branch]["PAG-IBIG Total"] = acc[branch]["PAG-IBIG EE"] + acc[branch]["PAG-IBIG ER"];

        return acc;
    }, {});

    console.log("Branch Totals:", branchTotals);

    Object.entries(branchTotals).forEach(([branch, totals]) => {
        worksheet.addRow([
            branch,
            totals["Gross Pay"].toFixed(2),
            totals["SSS EE"].toFixed(2),
            totals["SSS ER"].toFixed(2),
            totals["SSS Total"].toFixed(2),
            totals["PHIC EE"].toFixed(2),
            totals["PHIC ER"].toFixed(2),
            totals["PHIC Total"].toFixed(2),
            totals["PAG-IBIG EE"].toFixed(2),
            totals["PAG-IBIG ER"].toFixed(2),
            totals["PAG-IBIG Total"].toFixed(2),
        ]);
    });

    const overallTotal = Object.values(branchTotals).reduce(
        (acc, totals) => {
            acc["Gross Pay"] += totals["Gross Pay"];
            acc["SSS EE"] += totals["SSS EE"];
            acc["SSS ER"] += totals["SSS ER"];
            acc["SSS Total"] += totals["SSS Total"];
            acc["PHIC EE"] += totals["PHIC EE"];
            acc["PHIC ER"] += totals["PHIC ER"];
            acc["PHIC Total"] += totals["PHIC Total"];
            acc["PAG-IBIG EE"] += totals["PAG-IBIG EE"];
            acc["PAG-IBIG ER"] += totals["PAG-IBIG ER"];
            acc["PAG-IBIG Total"] += totals["PAG-IBIG Total"];
            return acc;
        },
        {
            "Gross Pay": 0,
            "SSS EE": 0,
            "SSS ER": 0,
            "SSS Total": 0,
            "PHIC EE": 0,
            "PHIC ER": 0,
            "PHIC Total": 0,
            "PAG-IBIG EE": 0,
            "PAG-IBIG ER": 0,
            "PAG-IBIG Total": 0,
        }
    );

    const overallTotalRow = worksheet.addRow([
        "OVERALL TOTAL",
        overallTotal["Gross Pay"].toFixed(2),
        overallTotal["SSS EE"].toFixed(2),
        overallTotal["SSS ER"].toFixed(2),
        overallTotal["SSS Total"].toFixed(2),
        overallTotal["PHIC EE"].toFixed(2),
        overallTotal["PHIC ER"].toFixed(2),
        overallTotal["PHIC Total"].toFixed(2),
        overallTotal["PAG-IBIG EE"].toFixed(2),
        overallTotal["PAG-IBIG ER"].toFixed(2),
        overallTotal["PAG-IBIG Total"].toFixed(2),
    ]);
    overallTotalRow.eachCell((cell) => cell.font = { bold: true });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "EmployeeRemittance.xlsx");
};

const [SSSEEData, setSSSEEData] = useState({});
const [PHIPData, setPHIPData] = useState({});
const [SSSERData, setSSSERData] = useState({});

const calculateAllSSSEE = async () => {
    try {
        const calculatedData = await Promise.all(
            payrollData.map(async (payroll) => {
                const response = await axios.post('http://127.0.0.1:8000/api/payroll/calculate-sssee', { id: payroll.id });
                return { 
                    id: payroll.id, 
                    SSS_EE: response.data.SSS_EE, 
                    SSS_ER: response.data.SSS_ER,
                    PHIP_PREMIUM: response.data.PHIP_PREMIUM 
                };
            })
        );

        const SSSEEMap = {};
        const SSSERMap = {};
        const PHIPMap = {};

        calculatedData.forEach((item) => {
            SSSEEMap[item.id] = item.SSS_EE;
            SSSERMap[item.id] = item.SSS_ER; 
            PHIPMap[item.id] = item.PHIP_PREMIUM;
        });

        setSSSEEData(SSSEEMap);
        setSSSERData(SSSERMap);
        setPHIPData(PHIPMap);

    } catch (error) {
        console.error('Error calculating all SSS_EE, SSS_ER, and PHIP_PREMIUM values', error);
    }
};

const saveAllSSSEE = async () => {
    try {
        await axios.post('http://127.0.0.1:8000/api/payroll/save-all-sssee', { SSSEEData, SSSERData, PHIPData });
        alert('All SSS_EE, SSS_ER, and PHIP_PREMIUM values saved successfully');
    } catch (error) {
        console.error('Error saving all SSS_EE, SSS_ER, and PHIP_PREMIUM values', error);
    }
};

const [PagIBIGData, setPagIBIGData] = useState({});
const calculateAllPagibig = async () => {
    try {
        const calculatedData = await Promise.all(
            payrollData.map(async (payroll) => {
                try {
                    const response = await axios.post('http://127.0.0.1:8000/api/payroll/calculate-pagibig', {
                        id: payroll.id,
                    });
                    return { id: payroll.id, PagIBIG: response.data.PagIBIG };
                } catch (error) {
                    console.error(`Error calculating Pag-IBIG for ID ${payroll.id}:`, error);
                    return { id: payroll.id, PagIBIG: 'Error' };
                }
            })
        );

        const PagIBIGMap = Object.fromEntries(calculatedData.map(item => [item.id, item.PagIBIG]));

        setPagIBIGData(PagIBIGMap);
    } catch (error) {
        console.error('Error calculating all Pag-IBIG values:', error);
    }
};


const saveAllPagibig = async () => {
    try {
        const response = await axios.post('http://127.0.0.1:8000/api/payroll/save-all-pagibig', { PagIBIGData });

        console.log(response.data); // ✅ Log response to check if it succeeds
        alert('All Pag-IBIG values saved successfully');
    } catch (error) {
        console.error('Error saving all Pag-IBIG values:', error.response?.data || error.message);
        alert('Failed to save Pag-IBIG values.');
    }
};


const [isDialogOpen, setIsDialogOpen] = useState(false);
const [selectedPayroll, setSelectedPayroll] = useState(null); // For the selected row
const [updateValues, setUpdateValues] = useState({
    cash_loan_amount: '',
    emp_liab_amount: '',
});

const handleUpdateClick = (payroll) => {
    setSelectedPayroll(payroll);
    setUpdateValues({
        cash_loan_amount: payroll.cash_loan_amount || '',
        emp_liab_amount: payroll.emp_liab_amount || '',
    });
    setIsDialogOpen(true);
};

const handleSave = async () => {
    if (!selectedPayroll) {
        console.error("No selected payroll to update");
        return;
    }

    try {
        const payload = {
            cash_loan_amount: updateValues.cash_loan_amount === '' ? null : parseFloat(updateValues.cash_loan_amount),
            emp_liab_amount: updateValues.emp_liab_amount === '' ? null : parseFloat(updateValues.emp_liab_amount),
        };

        console.log("Saving data:", payload);

        const response = await fetch(`http://127.0.0.1:8000/api/payroll/${selectedPayroll.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save data');
        }

        const result = await response.json();
        console.log("Save successful:", result);

        alert('Payroll updated successfully!');
        setIsDialogOpen(false);
    } catch (error) {
        console.error("Error saving payroll:", error);
        alert(`Failed to save payroll: ${error.message}`);
    }
};



const [cashLoanData, setCashLoanData] = useState({});
const [empLiabData, setEmpLiabData] = useState({});

const calculateAllCashLoanAndEmpLiab = async () => {
    try {
        const calculatedData = await Promise.all(
            payrollData.map(async (payroll) => {
                if (payroll.cash_loan === 0.00 && payroll.emp_liab === 0.00) {
                    return { id: payroll.id, cash_loan: 0.00, emp_liab: 0.00 };
                }

                try {
                    const response = await axios.post('http://127.0.0.1:8000/api/payroll/calculate-cash-loan-emp-liab', { id: payroll.id });
                    return {
                        id: payroll.id,
                        cash_loan: response.data.cash_loan,
                        emp_liab: response.data.emp_liab,
                    };
                } catch (error) {
                    console.error(`Error calculating for payroll ID ${payroll.id}:`, error.response?.data || error.message);
                    return { id: payroll.id, cash_loan: 0.00, emp_liab: 0.00 };
                }
            })
        );

        const cashLoanMap = {};
        const empLiabMap = {};

        calculatedData.forEach((item) => {
            cashLoanMap[item.id] = item.cash_loan;
            empLiabMap[item.id] = item.emp_liab;
        });

        setCashLoanData(cashLoanMap);
        setEmpLiabData(empLiabMap);
    } catch (error) {
        console.error('Error calculating all Cash Loan and Emp Liab values:', error);
    }
};


const saveAllCashLoanAndEmpLiab = async () => {
    try {
        console.log('Saving data:', { cashLoanData, empLiabData });
        await axios.post('http://127.0.0.1:8000/api/payroll/save-all-cash-loan-emp-liab', { cashLoanData, empLiabData });
        alert('All Cash Loan and Emp Liab values saved successfully');
    } catch (error) {
        console.error('Error saving all Cash Loan and Emp Liab values', error);
    }
};


const [taxData, setTaxData] = useState({});

const calculateAllTax = async () => {
    try {
        const calculatedData = await Promise.all(
            payrollData.map(async (payroll) => {
                const response = await axios.post('http://127.0.0.1:8000/api/payroll/calculate-tax', { id: payroll.masterlist_id }); // Use payroll.masterlist_id
                return { id: payroll.id, tax: response.data.tax };
            })
        );

        const taxMap = calculatedData.reduce((acc, item) => {
            acc[item.id] = item.tax;
            return acc;
        }, {});

        setTaxData(taxMap);
    } catch (error) {
        console.error('Error calculating all tax values:', error);
    }
};

const saveAllTax = async () => {
    try {
        await axios.post('http://127.0.0.1:8000/api/payroll/save-all-tax', { taxData });
        alert('All Tax values saved successfully');
    } catch (error) {
        console.error('Error saving all Tax values:', error);
    }
};


    return (
       <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <header className="mb-6 border-b pb-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight">Generate Salaries</h1>
        <p className="text-sm text-gray-600 font-medium">Southseas Cargo - Payroll</p>
      </header>
        <div className={`overflow-x-auto transition-all duration-75 min-w-0 mx-auto py-6 ${isMediumScreen ? "w-[calc(100vw-22rem)]" : "w-[calc(100vw-9rem)]"}`}>
            

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-gray-700">Date From</label>
                    <input
                        type="date"
                        name="date_from"
                        value={filters.date_from}
                        onChange={handleInputChange}
                        className="mt-1 block w-full p-2 border rounded-lg bg-gray-50 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>

                <div>
                    <label className="block text-gray-700">Date To</label>
                    <input
                        type="date"
                        name="date_to"
                        value={filters.date_to}
                        onChange={handleInputChange}
                        className="mt-1 block w-full p-2 border rounded-lg bg-gray-50 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>

                <div>
                    <label className="block text-gray-700">Branch</label>
                    <select
                        name="branch"
                        value={filters.branch}
                        onChange={handleInputChange}
                        className="mt-1 block w-full p-2 border rounded-lg bg-gray-50 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                        <option value="all">All Branches</option>
                        <option value="Main">Main</option>
                        <option value="Bacolod">Bacolod</option>
                        <option value="Ozamis">Ozamis</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700">Payroll Type</label>
                    <select
                        name="employee_type"
                        value={filters.employee_type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full p-2 border rounded-lg bg-gray-50 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    >
                        <option value="all">Select All</option>
                        <option value="monthly">Monthly</option>
                        <option value="weekly">Weekly</option>
                    </select>
                </div>
            </div>

<div className="max-w-3xl mx-auto mt-8 p-4 bg-white rounded-lg shadow-lg space-y-3">
    <div className="bg-indigo-50 p-3 rounded-lg shadow-md grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
            onClick={fetchPayrollData}
            className="w-full bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition duration-300"
        >
            Filter Employee's
        </button>
        <button
            onClick={handlePrint}
            className="w-full bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 transition duration-300"
        >
            Print Payslip
        </button>
        <button
            onClick={handlePrintReceiving}
            className="w-full bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 transition duration-300"
        >
            Print Receiving
        </button>
    </div>

    <div className="bg-indigo-50 p-3 rounded-lg shadow-md grid grid-cols-1 sm:grid-cols-5 gap-3">
        <button
            onClick={calculateAllSSSEE}
            className="w-full bg-indigo-900 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
            Calculate SSS/PHIP Contri
        </button>
        <button
            onClick={calculateAllPagibig}
            className="w-full bg-teal-900 text-white px-3 py-1 rounded-lg hover:bg-teal-700 transition duration-300"
        >
            Calculate HDMF Contri
        </button>
        <button
            onClick={calculateAllCashLoanAndEmpLiab}
            className="w-full bg-blue-900 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition duration-300"
        >
            Calculate C.A/EE Liab
        </button>
        <button
            onClick={calculateAllLoans}
            className="w-full bg-red-900 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition duration-300"
        >
            Calculate SSS/HDMF Loans
        </button>
        <button
            onClick={calculateAllTax}
            className="w-full bg-yellow-900 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition duration-300"
        >
            Calculate Tax
        </button>
    </div>

    <div className="bg-indigo-50 p-3 rounded-lg shadow-md grid grid-cols-1 sm:grid-cols-5 gap-3">
        <button
            onClick={saveAllSSSEE}
            className="w-full bg-indigo-900 text-white px-3 py-1 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
            Save SSS/PHIP Contri
        </button>
        <button
            onClick={saveAllPagibig}
            className="w-full bg-teal-900 text-white px-3 py-1 rounded-lg hover:bg-teal-700 transition duration-300"
        >
            Save HDMF Contri
        </button>
        <button
            onClick={saveAllCashLoanAndEmpLiab}
            className="w-full bg-blue-900 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition duration-300"
        >
            Save C.A/EE Liab
        </button>
        <button
            onClick={saveAllLoans}
            className="w-full bg-red-900 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition duration-300"
        >
            Save SSS/HDMF Loans
        </button>
        <button
            onClick={saveAllTax}
            className="w-full bg-yellow-900 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition duration-300"
        >
            Save Tax
        </button>
    </div>
</div>
            
     
<div className="flex items-center space-x-4 mt-8">
  <form className="flex-1" onSubmit={(e) => e.preventDefault()}>
    <label
      htmlFor="search-input"
      className="sr-only text-sm font-medium text-gray-900 dark:text-white"
    >
      Search
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
      </div>
   
      <input
        type="search"
        id="search-input"
        className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="employee name, branch, or employee type"
        value={searchTerm}
        onChange={handleSearchChange}
        required
        aria-label="Search employees"
      />
    
      <button
        type="submit"
        className="absolute right-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Search
      </button>
    </div>
  </form>


  <button
    onClick={() => handleExportExcel(selectedRows, filteredData)}
    className="bg-green-900 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition duration-300 focus:ring focus:ring-green-500"
  >
    <strong>EXPORT MBOS</strong>
  </button>

  <button
    onClick={() => handleExportEmployeeRemittance(selectedRows, filteredData)}
    className="bg-green-900 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition duration-300 focus:ring focus:ring-green-500"
  >
    <strong>EXPORT REMITTANCE</strong>
  </button>

  <button
    onClick={() => handleExportPDF(selectedRows, filteredData)}
    className="bg-green-900 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition duration-300 focus:ring focus:ring-green-500"
  >
    <strong>EXPORT TO PDF</strong>
  </button>

</div>

            <h2 className="text-xl font-semibold mt-8">Payroll Data</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg mt-4">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th>
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAll}
                                    checked={selectedRows.length === filteredData.length}
                                />
                            </th>
                            <th className="px-4 py-2">Employee name</th>
                            <th className="px-4 py-2">Timesheet</th>
                            <th className="px-4 py-2">Branch</th>
                            <th className="px-4 py-2">Employee type</th>
                            <th className="px-4 py-2">Regular pay</th>
                            <th className="px-4 py-2">Cola pay</th>
                            <th className="px-4 py-2">Reg overtime</th>
                            <th className="px-4 py-2">Sp holiday pay</th>
                            <th className="px-4 py-2">Sp holiday ot</th>
                            <th className="px-4 py-2">Reg holiday pay</th>
                            <th className="px-4 py-2">Reg holiday ot</th>
                            <th className="px-4 py-2">Restday pay</th>
                            <th className="px-4 py-2">Restday ot</th>
                            <th className="px-4 py-2">Night diff pay</th>
                            <th className="px-4 py-2">Other income</th>
                            <th className="px-4 py-2">Leave with pay</th>
                            <th className="px-4 py-2">Gross pay</th>
                            
                            
                            <th className="px-4 py-2">SSS Premium</th>
                            <th className="px-4 py-2">SSS Loan</th>
                            <th className="px-4 py-2">SSS Cal</th>
                            <th className="px-4 py-2">SSS Lrp</th>
                            <th className="px-4 py-2">PHIP Premium</th>
                            <th className="px-4 py-2">HDMF Premium</th>
                            <th className="px-4 py-2">HDMF MP2</th>
                            <th className="px-4 py-2">HDMF Loan</th>
                            <th className="px-4 py-2">HDMF Cal</th>
                            <th className="px-4 py-2">Tax</th>
                            {/* Loan Headers */}
                            <th className="px-4 py-2">Cash Loan</th>
                            <th className="px-4 py-2">Employee Liab</th>
                            <th className="px-4 py-2">Cash Bond</th>
                            
                            
                            <th className="px-4 py-2">Health Card</th>
                            
                            
                            <th className="px-4 py-2">Canteen</th>
                            
                            
                            <th className="px-4 py-2">Total Deductions</th>
                            <th className="px-4 py-2">Net pay</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        
                        {filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center px-4 py-2 text-gray-500">
                                    No data found.
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((payroll, index) => (
                                <tr key={index} className="border-t">
                                    <td className="px-4 py-2">
                                        <input
                                            type="checkbox"
                                            onChange={() => handleRowSelect(payroll.id)}
                                            checked={selectedRows.includes(payroll.id)}
                                        />
                                    </td>
                                    <td className="px-4 py-2">{payroll.employee_name}</td>
                                    <td className="px-4 py-2">
                                        {formatDateRange(payroll.date_from, payroll.date_to)}
                                    </td>
                                    <td className="px-4 py-2">{payroll.branch}</td>
                                    <td className="px-4 py-2">{payroll.employee_type}</td>
                                    <td className="px-4 py-2">{formatCurrency(payroll.regular_pay)} [{payroll.total_working_hrs}]</td>
                                    <td className="px-4 py-2">{formatCurrency(payroll.cola_pay)}</td>
                                    <td className="px-4 py-2">{formatCurrency(payroll.reg_overtime_pay)} [{payroll.total_no_ot}]</td>
                                    <td className="px-4 py-2">{formatCurrency(payroll.sp_holiday_pay)} [{payroll.worked_sp_holiday}]</td>
                                    <td className="px-4 py-2">{formatCurrency(payroll.sp_holiday_ot_pay)} [{payroll.sp_holiday_ot}]</td>
                                    <td className="px-4 py-2">{formatCurrency(payroll.reg_holiday_pay)} [{payroll.worked_reg_holiday}]</td>
                                    <td className="px-4 py-2">{formatCurrency(payroll.reg_holiday_ot_pay)} [{payroll.reg_holiday_ot}]</td>
                                    <td className="px-4 py-2">{formatCurrency(payroll.restday_pay)} [{payroll.worked_restday}]</td>
                                    <td className="px-4 py-2">{formatCurrency(payroll.restday_ot_pay)} [{payroll.restday_ot}]</td>
                                    <td className="px-4 py-2">{formatCurrency(payroll.night_diff_pay)} [{payroll.night_diff}]</td>
                                    <td className="px-4 py-2">{formatCurrency(payroll.other_income)}</td>
                                    <td className="px-4 py-2">{formatCurrency(payroll.leave_with_pay)}</td>
                                    <td className="px-4 py-2">{formatCurrency(payroll.gross_pay)}</td>


                                    <td className="px-4 py-2">
                                        <span className={SSSEEData[payroll.id] ? 'text-blue-700' : 'text-black'}>
                                            {SSSEEData[payroll.id] !== undefined
                                                ? formatCurrency(SSSEEData[payroll.id])
                                                : formatCurrency(payroll.SSS_EE)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2">
                                        <span className={PHIPData[payroll.id] ? 'text-black' : 'text-blue-700'}>
                                            {LoanData[payroll.id]?.sss_loan_amount
                                                ? formatCurrency(LoanData[payroll.id].sss_loan_amount)
                                                : formatCurrency(payroll.sss_loan_amount)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2">
                                        <span className={PHIPData[payroll.id] ? 'text-black' : 'text-blue-700'}>
                                            {LoanData[payroll.id]?.sss_calamity_amount
                                                ? formatCurrency(LoanData[payroll.id].sss_calamity_amount)
                                                : formatCurrency(payroll.sss_calamity_amount)}
                                        </span>
                                    </td>
                                    
                                    <td className="px-4 py-2">
                                        <span className={PHIPData[payroll.id] ? 'text-black' : 'text-blue-700'}>
                                            {LoanData[payroll.id]?.sss_lrp_amount
                                                ? formatCurrency(LoanData[payroll.id].sss_lrp_amount)
                                                : formatCurrency(payroll.sss_lrp_amount)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2">
                                        <span className={PHIPData[payroll.id] ? 'text-blue-700' : 'text-black'}>
                                            {PHIPData[payroll.id] !== undefined
                                                ? formatCurrency(PHIPData[payroll.id])
                                                : formatCurrency(payroll.PHIP_PREMIUM)}
                                        </span>
                                    </td>
                                    
                                    <td className="px-4 py-2">
                                        <span className={PagIBIGData[payroll.id] ? 'text-blue-700' : 'text-black'}>
                                            {PagIBIGData[payroll.id] !== undefined
                                                ? formatCurrency(PagIBIGData[payroll.id])
                                                : formatCurrency(payroll.pag_ibig_prem)}  {/* HDMF PREMIUM */}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2">
                                        <span className={PHIPData[payroll.id] ? 'text-black' : 'text-blue-700'}>
                                            {LoanData[payroll.id]?.mp2_amount
                                                ? formatCurrency(LoanData[payroll.id].mp2_amount)
                                                : formatCurrency(payroll.mp2_amount)}
                                        </span>
                                    </td>
                                    
                                    <td className="px-4 py-2">
                                        <span className={PHIPData[payroll.id] ? 'text-black' : 'text-blue-700'}>
                                            {LoanData[payroll.id]?.hdmf_loan_amount
                                                ? formatCurrency(LoanData[payroll.id].hdmf_loan_amount)
                                                : formatCurrency(payroll.hdmf_loan_amount)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2">
                                        <span className={PHIPData[payroll.id] ? 'text-black' : 'text-blue-700'}>
                                            {LoanData[payroll.id]?.calamity_amount
                                                ? formatCurrency(LoanData[payroll.id].calamity_amount)
                                                : formatCurrency(payroll.calamity_amount)} {/* HDMF CALAMITY */}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2">
                                        <span className={taxData[payroll.id] ? 'text-blue-700' : 'text-black'}>
                                            {taxData[payroll.id] || formatCurrency(payroll.tax)}
                                        </span>
                                    </td>


                                            
                                    {/* Display Cash Loan */}
                                    <td className="px-4 py-2">
                                        <span className={cashLoanData[payroll.id] ? 'text-blue-700' : 'text-black'}>
                                            {cashLoanData[payroll.id] || formatCurrency(payroll.cash_loan_amount)}
                                        </span>
                                    </td>

                                          {/* Display Cash Loan */}
                                          <td className="px-4 py-2">
                                        <span className={empLiabData[payroll.id] ? 'text-blue-700' : 'text-black'}>
                                            {empLiabData[payroll.id] || formatCurrency(payroll.emp_liab_amount)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2">
                                        <span className={PHIPData[payroll.id] ? 'text-black' : 'text-blue-700'}>
                                            {LoanData[payroll.id]?.cash_bond_amount
                                                ? formatCurrency(LoanData[payroll.id].cash_bond_amount)
                                                : formatCurrency(payroll.cash_bond_amount)}
                                        </span>
                                    </td>

                                    <td className="px-4 py-2">
                                        <span className={PHIPData[payroll.id] ? 'text-black' : 'text-blue-700'}>
                                            {LoanData[payroll.id]?.health_card
                                                ? formatCurrency(LoanData[payroll.id].health_card)
                                                : formatCurrency(payroll.health_card)} 
                                        </span>
                                    </td>
                                    
                                    <td className="px-4 py-2">{formatCurrency(payroll.canteen)}</td>

                                

                                    

                                    <td className="px-4 py-2">
                                        <strong>
                                            {formatCurrency(
                                                ['canteen', 'calamity_amount', 'hdmf_loan_amount', 'health_card', 'emp_liab_amount', 'cash_bond_amount', 'cash_loan_amount', 'pag_ibig_prem', 'mp2_amount', 'PHIP_PREMIUM', 'sss_lrp_amount', 'sss_calamity_amount', 'sss_loan_amount', 'SSS_EE']
                                                    .reduce((sum, key) => sum + Number(key === 'cash_loan_amount' ? LoanData[payroll.id]?.cash_loan_amount || payroll.cash_loan_amount : payroll[key]) || 0, 0)
                                            )}
                                        </strong>
                                    </td>
                                                                        
                                    <td className="px-4 py-2">
                                        <strong>
                                            {formatCurrency(
                                                payroll.gross_pay -
                                                ['canteen', 'calamity_amount', 'hdmf_loan_amount', 'health_card', 'emp_liab_amount', 'cash_bond_amount', 'cash_loan_amount', 'pag_ibig_prem', 'mp2_amount', 'PHIP_PREMIUM', 'sss_lrp_amount', 'sss_calamity_amount', 'sss_loan_amount', 'SSS_EE']
                                                    .reduce((sum, key) => sum + Number(key === 'cash_loan_amount' ? LoanData[payroll.id]?.cash_loan_amount || payroll.cash_loan_amount : payroll[key]) || 0, 0)
                                            )}
                                        </strong>
                                    </td>

                                    <td className="px-4 py-2">
                                        <button
                                            className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                                            onClick={() => handleUpdateClick(payroll)}
                                        >
                                            Update
                                        </button>
                                    </td>





                                </tr>
                                
                            ))
                        )}
                    </tbody>
                </table>

                {isDialogOpen && selectedPayroll && (
                    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h3 className="text-xl font-semibold">Update Loans</h3>

                            <p className="mt-2 text-2xl font-semibold text-teal-700">
                                {selectedPayroll.first_name && selectedPayroll.last_name
                                    ? `${selectedPayroll.first_name} ${selectedPayroll.last_name}`
                                    : 'Employee Name Not Available'}
                            </p>

                            <div className="mt-4">
                                <label className="block text-sm font-medium">Cash Loan Amount</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded mt-2"
                                    value={updateValues.cash_loan_amount}
                                    onChange={(e) =>
                                        setUpdateValues({
                                            ...updateValues,
                                            cash_loan_amount: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium">Employee Liability Amount</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded mt-2"
                                    value={updateValues.emp_liab_amount}
                                    onChange={(e) =>
                                        setUpdateValues({
                                            ...updateValues,
                                            emp_liab_amount: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setIsDialogOpen(false)}
                                    className="px-4 py-2 mr-4 bg-gray-500 text-white rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-500 text-white rounded"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>
        </div>

        
    );
};

export default GenerateSalaries;
