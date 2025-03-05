import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ROICalculator = () => {
  const [inputs, setInputs] = useState({
    // Appointments
    monthlyAppointments: 500,
    avgAppointmentValue: 100,
    noShowRateBefore: 15,
    noShowRateAfter: 7.5,
    
    // Call volume
    dailyInboundCalls: 22.9,
    dailyOutboundCalls: 16,
    inboundAnswerRate: 70,
    
    // Staff
    receptionistSalary: 33000,
    managerSalary: 53000,
    
    // AI solution cost
    setupFee: 2000,
    monthlySoftwareCost: 459,
    costPerMinute: 0.14,
    costPerBooking: 2.5,
    
    // Assumptions
    staffCapacityConstraint: 30,
    aiInboundHandlingRate: 85,
    aiOutboundHandlingRate: 90,
    appointmentIncrease: 10,
    missedCallBookingRate: 40,
    avgCallMinutes: 3.5
  });
  
  const [results, setResults] = useState({
    costSavings: 0,
    revenueUpside: 0,
    netBenefit: 0,
    annualAICost: 0,
    monthlyRevenue: 0,
    annualRevenue: 0,
    breakdown: {
      missedCallRevenue: 0,
      noShowRevenue: 0,
      additionalApptsRevenue: 0
    },
    usage: {
      totalMinutes: 0,
      minutesCost: 0,
      totalNewBookings: 0,
      bookingFees: 0,
      baseSubscriptionCost: 0
    }
  });
  
  useEffect(() => {
    // Calculate monthly and annual revenue
    const monthlyRevenue = inputs.monthlyAppointments * inputs.avgAppointmentValue;
    const annualRevenue = monthlyRevenue * 12;
    
    // Calculate hourly rates
    const receptionistHourly = inputs.receptionistSalary / (40 * 52);
    const managerHourly = inputs.managerSalary / (40 * 52);
    
    // Call Metrics
    const totalInboundCalls = inputs.dailyInboundCalls * 5 * 52; // annual inbound calls
    const answeredInboundCalls = totalInboundCalls * (inputs.inboundAnswerRate / 100);
    const missedInboundCalls = totalInboundCalls - answeredInboundCalls;
    const totalOutboundCalls = inputs.dailyOutboundCalls * 5 * 52; // annual outbound calls
    
    // Cost Savings Calculations
    const inboundCallMinutes = 5; // minutes per call
    const inboundTimePerWeek = (inputs.dailyInboundCalls * inboundCallMinutes / 60) * 5; // hours per week
    const aiHandledInboundTime = inboundTimePerWeek * (inputs.aiInboundHandlingRate / 100);
    const receptionistInboundSavings = aiHandledInboundTime * receptionistHourly * 52;
    
    const outboundCallMinutes = 4; // minutes per call
    const outboundTimePerWeek = (inputs.dailyOutboundCalls * outboundCallMinutes / 60) * 5; // hours per week
    const aiHandledOutboundTime = outboundTimePerWeek * (inputs.aiOutboundHandlingRate / 100);
    const receptionistOutboundSavings = aiHandledOutboundTime * 0.7 * receptionistHourly * 52;
    const managerOutboundSavings = aiHandledOutboundTime * 0.3 * managerHourly * 52;
    
    const totalCostSavings = receptionistInboundSavings + receptionistOutboundSavings + managerOutboundSavings;
    
    // Revenue Upside Calculations
    
    // 1. No-show reduction - using direct before/after rates
    const noShowDifference = inputs.noShowRateBefore - inputs.noShowRateAfter;
    const recapturedAppointments = inputs.monthlyAppointments * (noShowDifference / 100) * 12;
    const noShowRecaptureRevenue = recapturedAppointments * inputs.avgAppointmentValue;
    
    // 2. Missed call recovery
    const recapturedCallsMonthly = (missedInboundCalls / 12) * (inputs.aiInboundHandlingRate / 100);
    const additionalBookingsFromMissedCalls = recapturedCallsMonthly * (inputs.missedCallBookingRate / 100);
    const missedCallRecaptureRevenue = additionalBookingsFromMissedCalls * inputs.avgAppointmentValue;
    
    // 3. Additional appointments from better scheduling
    const newAppointmentsPerYear = inputs.monthlyAppointments * (inputs.appointmentIncrease / 100) * 12;
    const additionalAppointmentsRevenue = newAppointmentsPerYear * inputs.avgAppointmentValue;
    
    const totalRevenueUpside = noShowRecaptureRevenue + missedCallRecaptureRevenue + additionalAppointmentsRevenue;
    
    // AI Solution Cost Calculations
    const baseAnnualCost = inputs.setupFee + (inputs.monthlySoftwareCost * 12);
    
    // Calculate usage-based costs
    // 1. Minutes used
    const aiHandledInboundCalls = (answeredInboundCalls + missedInboundCalls) * (inputs.aiInboundHandlingRate / 100);
    const aiHandledOutboundCalls = totalOutboundCalls * (inputs.aiOutboundHandlingRate / 100);
    const totalAIMinutes = (aiHandledInboundCalls + aiHandledOutboundCalls) * inputs.avgCallMinutes;
    const minutesCost = totalAIMinutes * inputs.costPerMinute;
    
    // 2. Booking fees
    const totalNewBookings = additionalBookingsFromMissedCalls + newAppointmentsPerYear;
    const bookingFees = totalNewBookings * inputs.costPerBooking;
    
    // Total AI cost
    const annualAICost = baseAnnualCost + minutesCost + bookingFees;
    
    // Net benefit
    const netBenefit = totalCostSavings + totalRevenueUpside - annualAICost;
    
    setResults({
      costSavings: Math.round(totalCostSavings),
      revenueUpside: Math.round(totalRevenueUpside),
      netBenefit: Math.round(netBenefit),
      annualAICost: Math.round(annualAICost),
      monthlyRevenue: Math.round(monthlyRevenue),
      annualRevenue: Math.round(annualRevenue),
      breakdown: {
        missedCallRevenue: Math.round(missedCallRecaptureRevenue),
        noShowRevenue: Math.round(noShowRecaptureRevenue),
        additionalApptsRevenue: Math.round(additionalAppointmentsRevenue)
      },
      usage: {
        totalMinutes: Math.round(totalAIMinutes),
        minutesCost: Math.round(minutesCost),
        totalNewBookings: Math.round(totalNewBookings),
        bookingFees: Math.round(bookingFees),
        baseSubscriptionCost: Math.round(baseAnnualCost)
      }
    });
  }, [inputs]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  const chartData = [
    { name: 'Cost Savings', value: results.costSavings, fill: '#4CAF50' },
    { name: 'Revenue Upside', value: results.revenueUpside, fill: '#2196F3' },
    { name: 'AI Solution Cost', value: -results.annualAICost, fill: '#F44336' },
    { name: 'Net Benefit', value: results.netBenefit, fill: '#9C27B0' }
  ];
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Beauty Clinic AI Voice Solution ROI Calculator</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left Column - Clinic Metrics */}
          <div>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-semibold mb-3">Clinic Metrics</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Appointments</label>
                  <input 
                    type="number" 
                    name="monthlyAppointments" 
                    value={inputs.monthlyAppointments} 
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Average Appointment Value ($)</label>
                  <input 
                    type="number" 
                    name="avgAppointmentValue" 
                    value={inputs.avgAppointmentValue} 
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">No-Show Rate Before (%)</label>
                    <input 
                      type="number" 
                      name="noShowRateBefore" 
                      value={inputs.noShowRateBefore} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">No-Show Rate After (%)</label>
                    <input 
                      type="number" 
                      name="noShowRateAfter" 
                      value={inputs.noShowRateAfter} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-100 p-2 rounded">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-medium">Monthly Revenue</p>
                      <p className="text-xl font-bold">${results.monthlyRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Annual Revenue</p>
                      <p className="text-xl font-bold">${results.annualRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Call Metrics</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Daily Inbound Calls</label>
                  <input 
                    type="number" 
                    name="dailyInboundCalls" 
                    value={inputs.dailyInboundCalls} 
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Inbound Answer Rate (%)</label>
                  <input 
                    type="number" 
                    name="inboundAnswerRate" 
                    value={inputs.inboundAnswerRate} 
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">% of inbound calls currently answered</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Daily Outbound Calls</label>
                  <input 
                    type="number" 
                    name="dailyOutboundCalls" 
                    value={inputs.dailyOutboundCalls} 
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Average Call Duration (minutes)</label>
                  <input 
                    type="number" 
                    name="avgCallMinutes" 
                    value={inputs.avgCallMinutes} 
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Costs and Assumptions */}
          <div>
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-semibold mb-3">AI Solution Costs</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Setup Fee ($)</label>
                    <input 
                      type="number" 
                      name="setupFee" 
                      value={inputs.setupFee} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Monthly Software Cost ($)</label>
                    <input 
                      type="number" 
                      name="monthlySoftwareCost" 
                      value={inputs.monthlySoftwareCost} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Cost Per Minute ($)</label>
                    <input 
                      type="number" 
                      name="costPerMinute" 
                      value={inputs.costPerMinute} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Cost Per Booking ($)</label>
                    <input 
                      type="number" 
                      name="costPerBooking" 
                      value={inputs.costPerBooking} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                      step="0.1"
                    />
                  </div>
                </div>
                
                <div className="bg-red-50 p-2 rounded border border-red-200">
                  <p className="text-sm font-medium">Annual AI Solution Cost</p>
                  <p className="text-xl font-bold">${results.annualAICost.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h2 className="text-lg font-semibold mb-3">Staff</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Receptionist Annual Salary ($)</label>
                  <input 
                    type="number" 
                    name="receptionistSalary" 
                    value={inputs.receptionistSalary} 
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Manager Annual Salary ($)</label>
                  <input 
                    type="number" 
                    name="managerSalary" 
                    value={inputs.managerSalary} 
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">Business Impact</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Appointment Increase (%)</label>
                  <input 
                    type="number" 
                    name="appointmentIncrease" 
                    value={inputs.appointmentIncrease} 
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage increase in total appointments from better scheduling
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Missed Call Booking Rate (%)</label>
                  <input 
                    type="number" 
                    name="missedCallBookingRate" 
                    value={inputs.missedCallBookingRate} 
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Percentage of missed calls that would have resulted in bookings
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">AI Inbound Handling (%)</label>
                    <input 
                      type="number" 
                      name="aiInboundHandlingRate" 
                      value={inputs.aiInboundHandlingRate} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">AI Outbound Handling (%)</label>
                    <input 
                      type="number" 
                      name="aiOutboundHandlingRate" 
                      value={inputs.aiOutboundHandlingRate} 
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Results Section */}
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">ROI Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-100 p-4 rounded-lg border border-green-200">
              <h3 className="text-md font-semibold text-green-700">Annual Cost Savings</h3>
              <p className="text-2xl font-bold">${results.costSavings.toLocaleString()}</p>
            </div>
            
            <div className="bg-blue-100 p-4 rounded-lg border border-blue-200">
              <h3 className="text-md font-semibold text-blue-700">Annual Revenue Upside</h3>
              <p className="text-2xl font-bold">${results.revenueUpside.toLocaleString()}</p>
            </div>
            
            <div className="bg-purple-100 p-4 rounded-lg border border-purple-200">
              <h3 className="text-md font-semibold text-purple-700">Net Annual Benefit</h3>
              <p className="text-2xl font-bold">${results.netBenefit.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Financial Impact Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Amount ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">No-Show Rate Impact</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Before', value: inputs.noShowRateBefore, fill: '#F44336' },
                      { name: 'After', value: inputs.noShowRateAfter, fill: '#4CAF50' }
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'No-Show Rate (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      formatter={(value) => [`${value.toFixed(1)}%`, 'No-Show Rate']}
                    />
                    <Legend />
                    <Bar dataKey="value" name="No-Show Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-center mt-2">
                Decrease from {inputs.noShowRateBefore}% to {inputs.noShowRateAfter}% = {(inputs.noShowRateBefore - inputs.noShowRateAfter).toFixed(1)}% improvement
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Revenue Breakdown</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>No-Show Reduction:</span>
                  <span className="font-medium">${results.breakdown.noShowRevenue.toLocaleString()}</span>
                </li>
                <li className="flex justify-between">
                  <span>Missed Call Recovery:</span>
                  <span className="font-medium">${results.breakdown.missedCallRevenue.toLocaleString()}</span>
                </li>
                <li className="flex justify-between">
                  <span>Additional Appointments:</span>
                  <span className="font-medium">${results.breakdown.additionalApptsRevenue.toLocaleString()}</span>
                </li>
                <li className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total Revenue Upside:</span>
                  <span>${results.revenueUpside.toLocaleString()}</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Usage-Based Costs</h3>
              <ul className="space-y-2">
                <li className="flex justify-between">
                  <span>Base Subscription:</span>
                  <span className="font-medium">${results.usage.baseSubscriptionCost.toLocaleString()}</span>
                </li>
                <li className="flex justify-between">
                  <span>Call Minutes ({results.usage.totalMinutes.toLocaleString()}):</span>
                  <span className="font-medium">${results.usage.minutesCost.toLocaleString()}</span>
                </li>
                <li className="flex justify-between">
                  <span>Booking Fees ({results.usage.totalNewBookings.toLocaleString()} bookings):</span>
                  <span className="font-medium">${results.usage.bookingFees.toLocaleString()}</span>
                </li>
                <li className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total Annual Cost:</span>
                  <span>${results.annualAICost.toLocaleString()}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">Calculation Notes</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <strong>No-Show Reduction:</strong> Calculated as ({inputs.noShowRateBefore}% - {inputs.noShowRateAfter}%) 
                × {inputs.monthlyAppointments} monthly appointments × ${inputs.avgAppointmentValue} × 12 months
              </li>
              <li>
                <strong>Missed Call Recovery:</strong> Based on {100 - inputs.inboundAnswerRate}% of daily inbound calls being missed, 
                with {inputs.missedCallBookingRate}% of those having booking intent
              </li>
              <li>
                <strong>Staff Time Savings:</strong> Based on hourly wages × time saved from AI handling {inputs.aiInboundHandlingRate}% 
                of inbound and {inputs.aiOutboundHandlingRate}% of outbound calls
              </li>
              <li>
                <strong>Call Minutes Cost:</strong> Calculated as total handled calls × average call duration × ${inputs.costPerMinute} per minute
              </li>
              <li>
                <strong>Booking Fees:</strong> Fees for new bookings gained from missed call recovery and better scheduling
              </li>
            </ul>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 text-center">
          Based on RingCentral research showing small businesses miss ~30% of calls due to capacity constraints.
          All calculations are estimates and actual results may vary.
        </div>
      </div>
    </div>
  );
};

export default ROICalculator;

// Render the calculator
ReactDOM.render(
  <ROICalculator />,
  document.getElementById('calculator-root')
);
