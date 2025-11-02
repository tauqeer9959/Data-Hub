import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
  ScatterChart,
  Legend,
  ReferenceLine,
  Treemap
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity,
  Download,
  Filter,
  Maximize2,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface DataPoint {
  name: string;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

interface ChartConfig {
  title: string;
  description?: string;
  data: DataPoint[];
  type: 'line' | 'area' | 'bar' | 'pie' | 'radar' | 'scatter' | 'composed' | 'treemap';
  xAxis?: string;
  yAxis?: string;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  customTooltip?: React.ComponentType<any>;
  height?: number;
}

const CHART_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', 
  '#d084d0', '#87d068', '#ffb347', '#87ceeb', '#dda0dd'
];

const PERFORMANCE_COLORS = {
  excellent: '#10b981',
  good: '#3b82f6',
  average: '#f59e0b',
  poor: '#ef4444',
  failing: '#dc2626'
};

export function DataVisualization({ 
  config, 
  className = '',
  interactive = true,
  exportable = true
}: { 
  config: ChartConfig;
  className?: string;
  interactive?: boolean;
  exportable?: boolean;
}) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [chartType, setChartType] = useState(config.type);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const filteredData = useMemo(() => {
    // Ensure data is an array and sanitize values
    if (!Array.isArray(config.data)) {
      return [{ name: 'No Data', value: 0 }];
    }
    
    // Filter and sanitize data
    const sanitized = config.data
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        name: String(item.name || 'Unknown'),
        value: Number(item.value) || 0,
        category: item.category,
        metadata: item.metadata
      }));
    
    return sanitized.length > 0 ? sanitized : [{ name: 'No Data', value: 0 }];
  }, [config.data, selectedTimeRange]);

  const renderCustomTooltip = (props: any) => {
    if (!props.active || !props.payload || !Array.isArray(props.payload)) return null;

    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm">{String(props.label || '')}</p>
        {props.payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span>{String(entry.name || 'Unknown')}: {Number(entry.value) || 0}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      height: config.height || 300,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={commonProps.height}>
            <LineChart {...commonProps}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              {config.showTooltip && (
                <Tooltip content={config.customTooltip || renderCustomTooltip} />
              )}
              {config.showLegend && <Legend />}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={config.colors?.[0] || CHART_COLORS[0]}
                strokeWidth={2}
                dot={{ fill: config.colors?.[0] || CHART_COLORS[0] }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={commonProps.height}>
            <AreaChart {...commonProps}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              {config.showTooltip && (
                <Tooltip content={config.customTooltip || renderCustomTooltip} />
              )}
              {config.showLegend && <Legend />}
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={config.colors?.[0] || CHART_COLORS[0]}
                fill={config.colors?.[0] || CHART_COLORS[0]}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={commonProps.height}>
            <BarChart {...commonProps}>
              {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey="name" />
              <YAxis />
              {config.showTooltip && (
                <Tooltip content={config.customTooltip || renderCustomTooltip} />
              )}
              {config.showLegend && <Legend />}
              <Bar 
                dataKey="value" 
                fill={config.colors?.[0] || CHART_COLORS[0]}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={commonProps.height}>
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => {
                  const displayName = String(name || 'Unknown');
                  const displayPercent = Number(percent) || 0;
                  return `${displayName} ${(displayPercent * 100).toFixed(0)}%`;
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {filteredData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={config.colors?.[index] || CHART_COLORS[index % CHART_COLORS.length]} 
                  />
                ))}
              </Pie>
              {config.showTooltip && <Tooltip />}
              {config.showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={commonProps.height}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={filteredData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              <Radar
                name="Value"
                dataKey="value"
                stroke={config.colors?.[0] || CHART_COLORS[0]}
                fill={config.colors?.[0] || CHART_COLORS[0]}
                fillOpacity={0.6}
              />
              {config.showTooltip && <Tooltip />}
            </RadarChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={commonProps.height}>
            <ScatterChart {...commonProps}>
              {config.showGrid && <CartesianGrid />}
              <XAxis dataKey="name" type="category" />
              <YAxis dataKey="value" />
              {config.showTooltip && <Tooltip cursor={{ strokeDasharray: '3 3' }} />}
              <Scatter 
                name="Data" 
                data={filteredData} 
                fill={config.colors?.[0] || CHART_COLORS[0]}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'treemap':
        return (
          <ResponsiveContainer width="100%" height={commonProps.height}>
            <Treemap
              data={filteredData}
              dataKey="value"
              aspectRatio={4/3}
              stroke="#fff"
              fill={config.colors?.[0] || CHART_COLORS[0]}
              content={({ root, depth, x, y, width, height, index, name, value }) => (
                <g>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                      fill: CHART_COLORS[index % CHART_COLORS.length],
                      stroke: '#fff',
                      strokeWidth: 2,
                      strokeOpacity: 1,
                    }}
                  />
                  {width > 50 && height > 30 && (
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={12}
                    >
                      <tspan x={x + width / 2} dy="-0.5em">{name}</tspan>
                      <tspan x={x + width / 2} dy="1em">{value}</tspan>
                    </text>
                  )}
                </g>
              )}
            />
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p>Unsupported chart type: {chartType}</p>
          </div>
        );
    }
  };

  const exportChart = () => {
    // Implementation for exporting chart as image/PDF
    const svg = document.querySelector('.recharts-wrapper svg');
    if (svg) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const data = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = `${config.title.replace(/\s+/g, '_').toLowerCase()}_chart.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(data);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${className} ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6' : ''}`}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {config.type === 'line' && <Activity className="h-5 w-5" />}
                {config.type === 'bar' && <BarChart3 className="h-5 w-5" />}
                {config.type === 'pie' && <PieChartIcon className="h-5 w-5" />}
                {config.title}
              </CardTitle>
              {config.description && (
                <p className="text-sm text-muted-foreground">{config.description}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {interactive && (
                <>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="pie">Pie</SelectItem>
                      <SelectItem value="radar">Radar</SelectItem>
                      <SelectItem value="scatter">Scatter</SelectItem>
                      <SelectItem value="treemap">Treemap</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="90d">90 days</SelectItem>
                      <SelectItem value="1y">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}
              
              {exportable && (
                <Button variant="outline" size="sm" onClick={exportChart}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
              
              {interactive && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Chart Statistics */}
            {filteredData.length > 0 && filteredData[0].name !== 'No Data' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {filteredData.reduce((sum, item) => sum + (Number(item.value) || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {filteredData.length > 0
                      ? (filteredData.reduce((sum, item) => sum + (Number(item.value) || 0), 0) / filteredData.length).toFixed(1)
                      : '0.0'}
                  </p>
                  <p className="text-xs text-muted-foreground">Average</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {filteredData.length > 0
                      ? Math.max(...filteredData.map(item => Number(item.value) || 0))
                      : 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Peak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {filteredData.length}
                  </p>
                  <p className="text-xs text-muted-foreground">Data Points</p>
                </div>
              </div>
            )}
            
            {/* Chart */}
            <div className="w-full">
              {filteredData.length > 0 && filteredData[0].name !== 'No Data' ? (
                renderChart()
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <p>No data available</p>
                    <p className="text-sm mt-2">Add academic records to see visualizations</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Data Insights */}
            {filteredData.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>
                  {filteredData.some(item => item.value > 0) ? (
                    <>
                      Trend: <TrendingUp className="h-3 w-3 inline text-green-500" /> Positive
                    </>
                  ) : (
                    <>
                      Trend: <TrendingDown className="h-3 w-3 inline text-red-500" /> Negative
                    </>
                  )}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Academic specific visualization components
export function GPAProgressChart({ semesterData }: { semesterData: any[] }) {
  const config: ChartConfig = {
    title: 'GPA Progress Over Time',
    description: 'Track your academic performance across semesters',
    data: semesterData.map(sem => ({ name: sem.semester, value: sem.gpa })),
    type: 'line',
    colors: ['#3b82f6'],
    showGrid: true,
    showTooltip: true,
    height: 350
  };

  return <DataVisualization config={config} />;
}

export function GradeDistributionChart({ gradeData }: { gradeData: any[] }) {
  const config: ChartConfig = {
    title: 'Grade Distribution',
    description: 'Overview of your grade performance',
    data: gradeData,
    type: 'pie',
    colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
    showLegend: true,
    showTooltip: true,
    height: 300
  };

  return <DataVisualization config={config} />;
}

export function SubjectPerformanceRadar({ subjectData }: { subjectData: any[] }) {
  const config: ChartConfig = {
    title: 'Subject Performance Analysis',
    description: 'Radar view of performance across different subjects',
    data: subjectData,
    type: 'radar',
    colors: ['#8884d8'],
    showTooltip: true,
    height: 400
  };

  return <DataVisualization config={config} />;
}

export function ProjectTimelineChart({ projectData }: { projectData: any[] }) {
  const config: ChartConfig = {
    title: 'Project Completion Timeline',
    description: 'Track project completion over time',
    data: projectData.map(project => ({ 
      name: project.title, 
      value: new Date(project.endDate).getTime() - new Date(project.startDate).getTime() 
    })),
    type: 'bar',
    colors: ['#06b6d4'],
    showGrid: true,
    showTooltip: true,
    height: 300
  };

  return <DataVisualization config={config} />;
}