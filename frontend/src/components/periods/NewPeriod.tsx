import { Button, Group, LoadingOverlay, Stack, Text, TextInput, useMantineTheme } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  DatesProvider,
  DatesRangeValue,
  MonthPicker,
} from "@mantine/dates";
// import { useState } from 'react';
import "dayjs/locale/es";
import {
  formatDateToMonthYearFormat,
} from "../../helpers/DateUtils";
import { useState } from "react";
import { savePeriod } from "../../helpers/Api.ts";
import { PeriodResponse } from "../../types/StatementTypes";
import { useDisclosure } from "@mantine/hooks";
// import CondoContext from "../../contexts/CondoContext";

export const NewPeriod = ({id, actionOnCancel, actionOnConfirm}: {id: string, actionOnCancel: ()=> void, actionOnConfirm: (response: PeriodResponse)=> void}) => {
  const theme = useMantineTheme();
  const [periodLabel, setPeriodLabel] = useState<string>("");
  const [opened, { open, close }] = useDisclosure(false);
  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      period: [null, null] as DatesRangeValue,
      amount: 0,
    },
    validate: {
        period: (values) => !values[0] && !values[1] ? 'Periodo no seleccionado': null,
    },
    
    onValuesChange(values) {
        handleOnChange(values.period);
    },
  });

  console.log("form.getValues()******", JSON.stringify(form.getValues()));
  console.log("form.errors", JSON.stringify(form.errors));
  const handleSubmit = async (values: {period: (Date | null)[], amount: number}) => {

    if (values.period[0] === null && values.period[1] === null) {
        console.error("Period not selected");
        return;
    }
    open();

    // const periodFrom = values.period[0];
    const periodTo = values.period[1] || values.period[0] || new Date();

    const periodDate = new Date(periodTo.toISOString());
    const p = `${periodDate.getUTCFullYear()}${("0" + (periodDate.getUTCMonth()+1)).slice(-2)}01`

    savePeriod(id, {
        from: values.period[0]?.toISOString() || "",
        to: periodTo.toISOString(),
        amount: values.amount,
        // unit: condoId,
        period: p
    }).then(([success, response]) => {  
        if (success) {
            console.log("Period saved", response);
            actionOnConfirm(response || {} as PeriodResponse);
        } else {
            console.error("Error saving period", response);
        }
    }).finally(() => close() ); 
  };

  function handleOnChange(value: (Date | null)[]): void {
    console.log("handleOnChange", JSON.stringify(value));
    //take the last value on the range and convert it to the long format MM/YYYY
    const lastValue = value[1] || value[0];// || new Date();
    console.log("lastValue", lastValue);

    if (!lastValue) {
        setPeriodLabel("");
        return;
    }

    const period = formatDateToMonthYearFormat(lastValue);
    console.log("period", period);
    setPeriodLabel(period);
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <LoadingOverlay
        visible={opened}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <form onSubmit={form.onSubmit((values) => handleSubmit(values))} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, padding: '20px 0' }}>
          {form.errors.period && (
            <Text c="red" size="sm" ta="center" mb="md">
              {form.errors.period}
            </Text>
          )}

          <Stack gap="md">
            {!periodLabel && (<Text size="sm" ta="center">Selecciona el periodo</Text>)}
            {periodLabel && (<Text size="md" c={theme.primaryColor} fw={500} ta="center">Periodo: {periodLabel.toLocaleUpperCase()}</Text>)}

            <DatesProvider
              settings={{
                consistentWeeks: true,
                locale: "es",
                firstDayOfWeek: 0,
                weekendDays: [0],
                timezone: "UTC",
                labelSeparator: " - ",
              }}
            >
              <MonthPicker
                numberOfColumns={2}
                aria-placeholder="Selecciona el periodo"
                key={form.key("period")}
                {...form.getInputProps("period")}
                type="range"
                size="sm"
              />
            </DatesProvider>

            <TextInput
              label="Total del recibo"
              placeholder="$0.00"
              key={form.key('amount')}
              {...form.getInputProps('amount', { type: 'input' })}
            />
          </Stack>
        </div>

        {/* Sticky buttons at bottom */}
        <div style={{ 
          borderTop: '1px solid var(--mantine-color-gray-3)', 
          padding: '20px 20px', 
          marginTop: 'auto',
          backgroundColor: 'var(--mantine-color-body)',
          position: 'sticky',
          bottom: 0,
          marginLeft: '-20px',
          marginRight: '-20px'
        }}>
          <Group justify="flex-end" gap="md">
            <Button variant="default" onClick={actionOnCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar
            </Button>
          </Group>
        </div>
      </form>
    </div>
  );
};
