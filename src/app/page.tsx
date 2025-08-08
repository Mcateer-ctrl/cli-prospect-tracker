
"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis, LineChart, Line, Cell } from "recharts";
import { useProspects } from '@/lib/hooks/use-prospects';
import type { ChartConfig } from "@/components/ui/chart";
import { Users, Target, CalendarCheck, TrendingUp } from "lucide-react";
import {
  isThisWeek,
  parseISO,
  endOfWeek,
  eachWeekOfInterval,
  format,
} from 'date-fns';

export default function DashboardPage() {
  const { prospects, isLoading } = useProspects();

  const stats = useMemo(() => {
    if (!prospects) return { total: 0, hotLeads: 0, followUpsThisWeek: 0, conversionRate: '0.0' };
    const wonCount = prospects.filter((p) => p.current_status === "Won").length;
    const lostCount = prospects.filter((p) => p.current_status === "Lost").length;
    const closedCount = wonCount + lostCount;
    const conversionRate = closedCount > 0 ? (wonCount / closedCount) * 100 : 0;
    const followUpsThisWeek = prospects.filter(p => p.follow_up_date && isThisWeek(parseISO(p.follow_up_date))).length;
    
    return {
      total: prospects.length,
      hotLeads: prospects.filter((p) => p.warm_cold_status === "Hot").length,
      followUpsThisWeek,
      conversionRate: conversionRate.toFixed(1),
    };
  }, [prospects]);

  const sourceData = useMemo(() => {
    if (!prospects) return [];
    const counts = prospects.reduce((acc, p) => {
      acc[p.source] = (acc[p.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([source, count]) => ({
      source,
      count,
    }));
  }, [prospects]);

  const statusData = useMemo(() => {
    if (!prospects) return [];
    const counts = prospects.reduce((acc, p) => {
      acc[p.current_status] = (acc[p.current_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      fill: `hsl(var(--chart-${index + 1}))`,
    }));
  }, [prospects]);

  const prospectsOverTimeData = useMemo(() => {
    if (!prospects || prospects.length === 0) return [];

    const sortedProspects = [...prospects].sort((a,b) => parseISO(a.date_added).getTime() - parseISO(b.date_added).getTime());
    if(!sortedProspects[0]?.date_added) return [];
    
    const firstDate = parseISO(sortedProspects[0].date_added);
    const lastDate = new Date();

    const weeks = eachWeekOfInterval({
        start: firstDate,
        end: lastDate
    }, { weekStartsOn: 1});

    return weeks.map(weekStart => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const count = sortedProspects.filter(p => {
            const addedDate = parseISO(p.date_added);
            return addedDate >= weekStart && addedDate <= weekEnd;
        }).length;

        return {
            date: format(weekStart, 'MMM d'),
            count,
        }
    })
  }, [prospects]);


  const statusChartConfig = {
    new: { label: "New", color: "hsl(var(--chart-1))" },
    contacted: { label: "Contacted", color: "hsl(var(--chart-2))" },
    "in-progress": { label: "In-Progress", color: "hsl(var(--chart-3))" },
    won: { label: "Won", color: "hsl(var(--chart-4))" },
    lost: { label: "Lost", color: "hsl(var(--chart-5))" },
  } satisfies ChartConfig;

  const sourceChartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const prospectsOverTimeChartConfig = {
    count: {
      label: "New Prospects",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">An overview of your client pipeline, including key metrics and charts.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="animate-fade-in-up">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prospects</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hotLeads}</div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-ups This Week</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.followUpsThisWeek}</div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <CardHeader>
            <CardTitle>Prospects by Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ChartContainer config={statusChartConfig} className="min-h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                   {statusData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
         <Card className="animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          <CardHeader>
            <CardTitle>Prospects by Source</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={sourceChartConfig} className="min-h-[250px] w-full">
              <BarChart accessibilityLayer data={sourceData}>
                <XAxis
                  dataKey="source"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 10)}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
       <div className="grid gap-6 md:grid-cols-1">
        <Card className="animate-fade-in-up" style={{animationDelay: '0.6s'}}>
            <CardHeader>
                <CardTitle>Prospects Added Over Time</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={prospectsOverTimeChartConfig} className="min-h-[300px] w-full">
                    <LineChart
                        accessibilityLayer
                        data={prospectsOverTimeData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12
                        }}
                    >
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        <Line
                            dataKey="count"
                            type="monotone"
                            stroke="var(--color-count)"
                            strokeWidth={2}
                            dot={true}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
