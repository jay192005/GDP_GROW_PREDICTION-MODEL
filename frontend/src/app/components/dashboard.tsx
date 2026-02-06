import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Sparkles, Download, RefreshCw, Info, AlertCircle, Check, BarChart3, Activity, DollarSign, Users, Package, Building2 } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import * as apiService from "../../services/api";
import { ChartDataPoint } from "../../services/api";

interface DashboardProps {
  onBack: () => void;
}

// Mock countries with additional data (fallback)
const mockCountries = [
  { name: "United States", region: "Americas", avgGrowth: 2.5 },
  { name: "China", region: "Asia", avgGrowth: 8.2 },
  { name: "India", region: "Asia", avgGrowth: 6.8 },
  { name: "Japan", region: "Asia", avgGrowth: 1.2 },
  { name: "Germany", region: "Europe", avgGrowth: 1.8 },
  { name: "United Kingdom", region: "Europe", avgGrowth: 2.1 },
  { name: "France", region: "Europe", avgGrowth: 1.6 },
  { name: "Brazil", region: "Americas", avgGrowth: 2.3 },
  { name: "Italy", region: "Europe", avgGrowth: 0.9 },
  { name: "Canada", region: "Americas", avgGrowth: 2.2 },
  { name: "South Korea", region: "Asia", avgGrowth: 3.5 },
  { name: "Russia", region: "Europe", avgGrowth: 1.7 },
  { name: "Australia", region: "Oceania", avgGrowth: 2.8 },
  { name: "Spain", region: "Europe", avgGrowth: 1.5 },
  { name: "Mexico", region: "Americas", avgGrowth: 2.1 },
];

// Generate historical GDP data (1973-2024)
const generateHistoricalData = (country: string) => {
  const data = [];
  const countryData = countries.find((c) => c.name === country);
  const baseGrowth = countryData?.avgGrowth || 3;
  
  for (let year = 1973; year <= 2024; year++) {
    const randomVariation = (Math.random() - 0.5) * 4;
    const cyclicalPattern = Math.sin((year - 1973) / 10) * 2;
    const growth = baseGrowth + randomVariation + cyclicalPattern;
    
    data.push({
      year: year.toString(),
      growth: parseFloat(growth.toFixed(2)),
      type: "historical",
    });
  }
  
  return data;
};

export function Dashboard({ onBack }: DashboardProps) {
  console.log('Dashboard component rendering...');
  
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [populationGrowth, setPopulationGrowth] = useState("");
  const [exportsGrowth, setExportsGrowth] = useState("");
  const [importsGrowth, setImportsGrowth] = useState("");
  const [investment, setInvestment] = useState("");
  const [consumption, setConsumption] = useState("");
  const [governmentSpending, setGovernmentSpending] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  
  const [prediction, setPrediction] = useState<number | null>(null);
  const [historicalData, setHistoricalData] = useState<ChartDataPoint[]>([]);
  const [showPrediction, setShowPrediction] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(94);
  const [contributionData, setContributionData] = useState<any[]>([]);
  
  // New state variables for API integration
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [predictionMethod, setPredictionMethod] = useState<string>("");
  const [apiError, setApiError] = useState<string | null>(null);
  
  // State for countries list
  const [countries, setCountries] = useState<string[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

  // Fetch countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        console.log('Fetching countries from API...');
        const countryList = await apiService.fetchCountries();
        console.log('Countries loaded:', countryList.length);
        setCountries(countryList);
      } catch (error) {
        console.error('Failed to load countries:', error);
        // Fallback to mock countries if API fails
        const fallbackCountries = mockCountries.map(c => c.name);
        console.log('Using fallback countries:', fallbackCountries.length);
        setCountries(fallbackCountries);
      } finally {
        setIsLoadingCountries(false);
      }
    };
    
    loadCountries();
  }, []);

  // Handle country selection and fetch historical data
  const handleCountryChange = async (country: string) => {
    setSelectedCountry(country);
    setIsLoadingHistory(true);
    setHistoryError(null);
    
    try {
      const data = await apiService.fetchHistoricalData(country);
      const transformed = apiService.transformHistoricalData(data);
      setHistoricalData(transformed);
    } catch (error) {
      const apiErr = apiService.handleApiError(error);
      setHistoryError(apiErr.message);
      // Fallback to mock data
      const mockData = generateHistoricalData(country);
      setHistoricalData(mockData);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handlePredict = async () => {
    if (!selectedCountry || !populationGrowth || !exportsGrowth || !importsGrowth || !investment || !consumption || !governmentSpending) {
      return;
    }

    setIsCalculating(true);
    setApiError(null);

    try {
      // Construct scenario simulation request
      const requestData: apiService.PredictionRequest = {
        Country: selectedCountry,
        Population_Growth_Rate: parseFloat(populationGrowth),
        Exports_Growth_Rate: parseFloat(exportsGrowth),
        Imports_Growth_Rate: parseFloat(importsGrowth),
        Investment_Growth_Rate: parseFloat(investment),
        Consumption_Growth_Rate: parseFloat(consumption),
        Govt_Spend_Growth_Rate: parseFloat(governmentSpending),
      };

      // Call API
      const response = await apiService.submitPrediction(requestData);

      // Update prediction state
      setPrediction(response.predicted_gdp_growth);
      setPredictionMethod(response.model_type);

      // Fetch historical data if not already loaded
      if (historicalData.length === 0 || historicalData.every(d => d.type === 'prediction')) {
        const historical = await apiService.fetchHistoricalData(selectedCountry);
        const transformed = apiService.transformHistoricalData(historical);
        setHistoricalData(transformed);
      }

      // Add prediction to timeline
      const historicalOnly = historicalData.filter(d => d.type === 'historical');
      const withPrediction = apiService.addPredictionToTimeline(response.predicted_gdp_growth, historicalOnly);
      setHistoricalData(withPrediction);

      // Calculate contribution breakdown
      const pop = parseFloat(populationGrowth);
      const exp = parseFloat(exportsGrowth);
      const imp = parseFloat(importsGrowth);
      const inv = parseFloat(investment);
      const con = parseFloat(consumption);
      const gov = parseFloat(governmentSpending);

      const contributions = [
        { name: "Population", value: pop * 0.15, percentage: 15 },
        { name: "Exports", value: exp * 0.25, percentage: 25 },
        { name: "Trade Balance", value: (exp - imp) * 0.2, percentage: 20 },
        { name: "Investment", value: inv * 0.2, percentage: 20 },
        { name: "Consumption", value: con * 0.15, percentage: 15 },
        { name: "Govt Spending", value: gov * 0.05, percentage: 5 },
      ];
      setContributionData(contributions);

      // Calculate confidence based on input consistency
      const consistency = 100 - Math.abs(exp - imp) * 2 - Math.abs(inv - con) * 1.5;
      setConfidenceScore(Math.max(85, Math.min(98, consistency)));

      setShowPrediction(true);
    } catch (error) {
      const apiErr = apiService.handleApiError(error);
      setApiError(apiErr.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setPopulationGrowth("");
    setExportsGrowth("");
    setImportsGrowth("");
    setInvestment("");
    setConsumption("");
    setGovernmentSpending("");
    setShowPrediction(false);
    setPrediction(null);
  };

  const handleExport = () => {
    alert("Export functionality would download predictions as PDF/CSV");
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
          <p className="font-semibold text-[#0f172a]">Year: {data.year}</p>
          <p className="text-[#10b981] font-semibold">Growth: {data.growth}%</p>
          <p className="text-xs text-gray-500 capitalize mt-1">
            {data.type === "historical" ? "📊 Historical Data" : "🔮 AI Prediction"}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get recent years data for comparison
  const getRecentTrend = () => {
    if (historicalData.length === 0) return null;
    const recent = historicalData.slice(-6, -2);
    const avgGrowth = recent.reduce((sum, d) => sum + d.growth, 0) / recent.length;
    return avgGrowth.toFixed(2);
  };

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  // Radar chart data for economic indicators
  const getRadarData = () => {
    if (!showPrediction) return [];
    return [
      {
        indicator: 'Population',
        value: parseFloat(populationGrowth) || 0,
        fullMark: 10,
      },
      {
        indicator: 'Exports',
        value: parseFloat(exportsGrowth) || 0,
        fullMark: 10,
      },
      {
        indicator: 'Imports',
        value: parseFloat(importsGrowth) || 0,
        fullMark: 10,
      },
      {
        indicator: 'Investment',
        value: parseFloat(investment) || 0,
        fullMark: 10,
      },
      {
        indicator: 'Consumption',
        value: parseFloat(consumption) || 0,
        fullMark: 10,
      },
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0]">
      {/* Header */}
      <header className="bg-[#0f172a] text-white py-6 px-8 shadow-lg sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl">GDP Forecaster Dashboard</h1>
              <p className="text-gray-400 text-sm">AI-Powered Economic Analytics & Predictions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#10b981]/20 px-4 py-2 rounded-lg">
              <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></div>
              <span className="text-sm">AI Model Active</span>
            </div>
            {showPrediction && (
              <Button
                variant="outline"
                onClick={handleExport}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-8">
        {/* Error Banner for Historical Data */}
        {historyError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-yellow-900 font-medium">⚠️ Unable to load historical data</p>
                <p className="text-yellow-700 text-sm">Showing estimated data. {historyError}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedCountry && handleCountryChange(selectedCountry)}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
          {/* Left Panel - Input Parameters */}
          <div className="space-y-6">
            {/* Input Card */}
            <Card className="p-6 bg-white shadow-xl rounded-2xl border-0">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl text-[#0f172a]">Economic Indicators</h2>
                <div className="flex items-center gap-2">
                  {isLoadingHistory && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading...
                    </div>
                  )}
                  {showPrediction && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="text-gray-500 hover:text-[#10b981]"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                {/* Country Selection */}
                <div>
                  <Label className="text-gray-700 mb-2 block flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#10b981]" />
                    Select Country
                  </Label>
                  <Select value={selectedCountry} onValueChange={handleCountryChange} disabled={isLoadingCountries}>
                    <SelectTrigger className="bg-[#f1f5f9] border-0 h-12 hover:bg-[#e2e8f0] transition-colors">
                      <SelectValue placeholder={isLoadingCountries ? "Loading countries..." : "Select a country..."} />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCountry && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Historical data: 1972-2021
                    </p>
                  )}
                </div>

                {/* Population Growth */}
                <div>
                  <Label className="text-gray-700 mb-2 block flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Population Growth (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 1.1"
                    value={populationGrowth}
                    onChange={(e) => setPopulationGrowth(e.target.value)}
                    className="bg-[#f1f5f9] border-0 h-12 hover:bg-[#e2e8f0] transition-colors"
                  />
                  {populationGrowth && (
                    <div className="mt-2">
                      <Progress value={Math.min(parseFloat(populationGrowth) * 10, 100)} className="h-1" />
                    </div>
                  )}
                </div>

                {/* Exports Growth */}
                <div>
                  <Label className="text-gray-700 mb-2 block flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Exports Growth (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 5.2"
                    value={exportsGrowth}
                    onChange={(e) => setExportsGrowth(e.target.value)}
                    className="bg-[#f1f5f9] border-0 h-12 hover:bg-[#e2e8f0] transition-colors"
                  />
                  {exportsGrowth && (
                    <div className="mt-2">
                      <Progress value={Math.min(parseFloat(exportsGrowth) * 10, 100)} className="h-1" />
                    </div>
                  )}
                </div>

                {/* Imports Growth */}
                <div>
                  <Label className="text-gray-700 mb-2 block flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-orange-500" />
                    Imports Growth (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 4.8"
                    value={importsGrowth}
                    onChange={(e) => setImportsGrowth(e.target.value)}
                    className="bg-[#f1f5f9] border-0 h-12 hover:bg-[#e2e8f0] transition-colors"
                  />
                  {importsGrowth && (
                    <div className="mt-2">
                      <Progress value={Math.min(parseFloat(importsGrowth) * 10, 100)} className="h-1" />
                    </div>
                  )}
                </div>

                {/* Investment */}
                <div>
                  <Label className="text-gray-700 mb-2 block flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-purple-500" />
                    Investment (Capital Formation) (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 3.5"
                    value={investment}
                    onChange={(e) => setInvestment(e.target.value)}
                    className="bg-[#f1f5f9] border-0 h-12 hover:bg-[#e2e8f0] transition-colors"
                  />
                  {investment && (
                    <div className="mt-2">
                      <Progress value={Math.min(parseFloat(investment) * 10, 100)} className="h-1" />
                    </div>
                  )}
                </div>

                {/* Consumption */}
                <div>
                  <Label className="text-gray-700 mb-2 block flex items-center gap-2">
                    <Package className="w-4 h-4 text-red-500" />
                    Consumption Expenditure (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 2.8"
                    value={consumption}
                    onChange={(e) => setConsumption(e.target.value)}
                    className="bg-[#f1f5f9] border-0 h-12 hover:bg-[#e2e8f0] transition-colors"
                  />
                  {consumption && (
                    <div className="mt-2">
                      <Progress value={Math.min(parseFloat(consumption) * 10, 100)} className="h-1" />
                    </div>
                  )}
                </div>

                {/* Government Spending */}
                <div>
                  <Label className="text-gray-700 mb-2 block flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-500" />
                    Government Spending (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 2.0"
                    value={governmentSpending}
                    onChange={(e) => setGovernmentSpending(e.target.value)}
                    className="bg-[#f1f5f9] border-0 h-12 hover:bg-[#e2e8f0] transition-colors"
                  />
                  {governmentSpending && (
                    <div className="mt-2">
                      <Progress value={Math.min(parseFloat(governmentSpending) * 10, 100)} className="h-1" />
                    </div>
                  )}
                </div>

                {/* Predict Button */}
                <Button
                  onClick={handlePredict}
                  disabled={!selectedCountry || !populationGrowth || !exportsGrowth || !importsGrowth || !investment || !consumption || !governmentSpending || isCalculating}
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white h-14 rounded-xl shadow-lg shadow-[#10b981]/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Calculating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Generate Prediction
                    </span>
                  )}
                </Button>
              </div>
            </Card>

            {/* Quick Stats Card */}
            {showPrediction && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="p-6 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white shadow-xl rounded-2xl border-0">
                  <h3 className="text-lg mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#10b981]" />
                    Quick Insights
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">5-Year Avg</span>
                      <span className="text-lg">{getRecentTrend()}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Confidence</span>
                      <span className="text-lg text-[#10b981]">{confidenceScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Trend</span>
                      <span className="text-lg flex items-center gap-1">
                        {prediction && prediction > parseFloat(getRecentTrend() || "0") ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-[#10b981]" />
                            Bullish
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4 text-orange-400" />
                            Bearish
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Panel - Visualization & Results */}
          <div className="space-y-6">
            {/* Prediction Error Display */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-900 mb-2">Prediction Error</h3>
                      <p className="text-red-700 mb-4">{apiError}</p>
                      <Button
                        onClick={handlePredict}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Prediction Card */}
            <AnimatePresence>
              {showPrediction && prediction !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="p-8 bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-2xl rounded-2xl border-0 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Check className="w-5 h-5" />
                            <span className="text-sm opacity-90">Prediction Complete</span>
                          </div>
                          <h2 className="text-lg opacity-90">Predicted GDP Growth Rate</h2>
                        </div>
                        <div className="bg-white/20 rounded-xl px-4 py-3 backdrop-blur-sm">
                          <p className="text-xs opacity-90">Confidence</p>
                          <p className="text-3xl">{confidenceScore}%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-baseline gap-4 mb-4">
                        <span className="text-7xl">{prediction}%</span>
                        <TrendingUp className="w-12 h-12 animate-pulse" />
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm opacity-90">
                        <div>
                          <p className="opacity-75">Country</p>
                          <p className="text-lg">{selectedCountry}</p>
                        </div>
                        <div>
                          <p className="opacity-75">Forecast Period</p>
                          <p className="text-lg">2022-2023</p>
                        </div>
                        {predictionMethod && (
                          <div>
                            <p className="opacity-75">Method</p>
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                              predictionMethod === 'AI Model' 
                                ? 'bg-green-500/30 text-green-100' 
                                : 'bg-blue-500/30 text-blue-100'
                            }`}>
                              <Sparkles className="w-3 h-3" />
                              {predictionMethod}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tabs for different visualizations */}
            <Card className="p-6 bg-white shadow-xl rounded-2xl border-0">
              {showPrediction && historicalData.length > 0 ? (
                <Tabs defaultValue="timeline" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 mb-6">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="comparison">Comparison</TabsTrigger>
                    <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                    <TabsTrigger value="indicators">Indicators</TabsTrigger>
                  </TabsList>

                  {/* Timeline Chart */}
                  <TabsContent value="timeline" className="mt-0">
                    <div>
                      <h3 className="text-xl mb-6 text-[#0f172a]">GDP Growth Timeline (1972-2023)</h3>
                      <ResponsiveContainer width="100%" height={450}>
                        <AreaChart data={historicalData}>
                          <defs>
                            <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="year"
                            stroke="#64748b"
                            tick={{ fontSize: 12 }}
                            interval={Math.floor(historicalData.length / 15)}
                          />
                          <YAxis
                            stroke="#64748b"
                            tick={{ fontSize: 12 }}
                            label={{ value: "Growth Rate (%)", angle: -90, position: "insideLeft" }}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="growth"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#colorGrowth)"
                            data={historicalData.filter((d) => d.type === "historical")}
                            name="Historical"
                          />
                          <Area
                            type="monotone"
                            dataKey="growth"
                            stroke="#10b981"
                            strokeWidth={3}
                            fill="url(#colorPrediction)"
                            strokeDasharray="5 5"
                            data={historicalData.filter((d) => d.type === "prediction")}
                            name="Prediction"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  {/* Comparison Bar Chart */}
                  <TabsContent value="comparison" className="mt-0">
                    <div>
                      <h3 className="text-xl mb-6 text-[#0f172a]">Decade Comparison</h3>
                      <ResponsiveContainer width="100%" height={450}>
                        <BarChart
                          data={[
                            { decade: "1970s", growth: 3.5 },
                            { decade: "1980s", growth: 3.2 },
                            { decade: "1990s", growth: 3.8 },
                            { decade: "2000s", growth: 3.1 },
                            { decade: "2010s", growth: 2.9 },
                            { decade: "2020s", growth: prediction || 0 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="decade" stroke="#64748b" />
                          <YAxis stroke="#64748b" label={{ value: "Avg Growth (%)", angle: -90, position: "insideLeft" }} />
                          <Tooltip />
                          <Bar dataKey="growth" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </TabsContent>

                  {/* Contribution Breakdown */}
                  <TabsContent value="breakdown" className="mt-0">
                    <div>
                      <h3 className="text-xl mb-6 text-[#0f172a]">GDP Growth Contributors</h3>
                      <div className="grid grid-cols-2 gap-6">
                        <ResponsiveContainer width="100%" height={400}>
                          <PieChart>
                            <Pie
                              data={contributionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percentage }) => `${name}: ${percentage}%`}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="percentage"
                            >
                              {contributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        
                        <div className="space-y-4">
                          {contributionData.map((item, index) => (
                            <div key={item.name} className="border-l-4 pl-4 py-2" style={{ borderColor: COLORS[index] }}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{item.name}</span>
                                <span className="text-sm font-semibold">{item.value.toFixed(2)}%</span>
                              </div>
                              <Progress value={item.percentage} className="h-2" />
                              <p className="text-xs text-gray-500 mt-1">Weight: {item.percentage}%</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Radar Chart for Indicators */}
                  <TabsContent value="indicators" className="mt-0">
                    <div>
                      <h3 className="text-xl mb-6 text-[#0f172a]">Economic Indicators Radar</h3>
                      <ResponsiveContainer width="100%" height={450}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getRadarData()}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="indicator" stroke="#64748b" />
                          <PolarRadiusAxis stroke="#64748b" />
                          <Radar
                            name="Current Values"
                            dataKey="value"
                            stroke="#10b981"
                            fill="#10b981"
                            fillOpacity={0.6}
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                      
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2">
                          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-blue-900 font-medium">Interpretation Guide</p>
                            <p className="text-xs text-blue-700 mt-1">
                              The radar chart visualizes the balance of economic indicators. A balanced shape 
                              indicates sustainable growth, while skewed patterns suggest over-reliance on specific factors.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="h-[500px] flex items-center justify-center text-gray-400">
                  <div className="text-center max-w-md">
                    <Sparkles className="w-20 h-20 mx-auto mb-6 opacity-50" />
                    <h3 className="text-2xl text-gray-600 mb-3">Ready to Predict</h3>
                    <p className="text-base text-gray-500 mb-6">
                      Enter economic indicators on the left panel to generate comprehensive GDP growth predictions with interactive visualizations
                    </p>
                    <div className="flex items-center justify-center gap-8 text-sm">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Activity className="w-6 h-6 text-[#10b981]" />
                        </div>
                        <p>50+ Years</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                          <BarChart3 className="w-6 h-6 text-blue-500" />
                        </div>
                        <p>4 Charts</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Sparkles className="w-6 h-6 text-purple-500" />
                        </div>
                        <p>AI Analysis</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
