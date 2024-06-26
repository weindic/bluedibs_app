import { Paper, Text, useMantineTheme } from "@mantine/core";
import { ResponsiveLine } from "@nivo/line";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper withBorder p={"xs"} shadow="md" className="custom-tooltip">
        <Text size="xs">{`Price : ${payload[0].value}`}</Text>
      </Paper>
    );
  }

  return null;
};

export function MinChart({ data }: { data: any[] }) {
  const theme = useMantineTheme();

  return (
    <ResponsiveContainer>
      <AreaChart data={data ?? []}>
        <CartesianGrid strokeDasharray="1 2" />

        <Area
          type="linear"
          dataKey="y"
          stroke={theme.colors.green[6]}
          fill={theme.colors.green[6]}
          dot={{
            stroke: theme.colors.green[8],
            strokeWidth: 4,
            r: 1,
          }}
        />

        <Tooltip content={<CustomTooltip />} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function Chart({ data }: { data: any[] }) {
  return <MinChart data={data} />;
}
