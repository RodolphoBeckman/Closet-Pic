"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartData } from "@/types"

type ChartViewProps = {
    data: ChartData[];
}

export function ChartView({ data }: ChartViewProps) {
  const chartConfig = {
    referencias: {
      label: "Referências",
      color: "hsl(var(--primary))",
    },
  }

  if (!data || data.length === 0) {
    return (
        <Card className="flex items-center justify-center h-96">
            <CardContent>
                <p className="text-muted-foreground">Não há dados para exibir no gráfico.</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Referências por Marca</CardTitle>
        <CardDescription>Quantidade de referências únicas para cada marca.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={data} margin={{ top: 20 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="marca"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis allowDecimals={false} />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Legend />
            <Bar dataKey="referencias" fill="var(--color-referencias)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
