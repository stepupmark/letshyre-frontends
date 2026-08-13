import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { MonthlyRevenueDataPoint } from "../../../api/revenue.api";

interface RevenueBarChartProps {
  data: MonthlyRevenueDataPoint[];
  currency: "USD" | "INR";
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  currency?: "USD" | "INR";
}

const CustomTooltip = ({ active, payload, label, currency = "USD" }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const formattedValue = payload[0].value.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: currency === 'INR' ? 'INR' : 'USD',
      maximumFractionDigits: 0,
    });
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-3 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 pointer-events-none"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
          <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{label}</p>
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {formattedValue}
          </p>
        </div>
      </motion.div>
    );
  }
  return null;
};

export default function RevenueBarChart({ data, currency }: RevenueBarChartProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="w-full h-[400px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 0,
            left: -20,
            bottom: 10,
          }}
          barSize={40}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
            className="dark:stroke-gray-700"
          />
          <XAxis
            dataKey="month"
            axisLine={true}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
            dy={10}
            stroke="#E5E7EB"
            className="dark:stroke-gray-700"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
            dx={-10}
            tickFormatter={(value) => {
              if (value === 0) return "0";
              if (value >= 1000) return `${currency === 'INR' ? '₹' : '$'}${(value / 1000).toFixed(1)}k`;
              return `${currency === 'INR' ? '₹' : '$'}${value}`;
            }}
          />
          <Tooltip 
            cursor={{ fill: "rgba(59, 130, 246, 0.08)", radius: 6 }}
            content={(props) => <CustomTooltip {...props} currency={currency} />}
          />
          <Legend
            iconType="square"
            iconSize={10}
            formatter={(value) => (
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                {value.replace("(USD)", `(${currency})`)}
              </span>
            )}
            wrapperStyle={{ paddingTop: "20px" }}
          />
          <Bar
            dataKey="revenue"
            name={`Revenue (${currency})`}
            radius={[6, 6, 0, 0]}
            animationDuration={1500}
            label={{
              position: "top",
              fill: "#3B82F6",
              fontSize: 12,
              fontWeight: 600,
              formatter: (value: number) => {
                if (value === 0) return "";
                if (value >= 1000) return `${currency === 'INR' ? '₹' : '$'}${(value / 1000).toFixed(1)}k`;
                return `${currency === 'INR' ? '₹' : '$'}${value}`;
              },
            }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.revenue > 0 ? "#3B82F6" : "#E5E7EB"}
                className={entry.revenue > 0 ? "hover:fill-blue-400 transition-all duration-300 cursor-pointer" : "dark:fill-gray-700"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
