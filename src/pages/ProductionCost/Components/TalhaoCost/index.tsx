import { useContext, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Container, Loader } from './styles';

import { TalhaoCostChart } from '../TalhaoCostChart';
import { Spinner } from '../../../../components/Spinner';

import CustoProducaoService from '../../../../services/CustoProducaoService';

import { toast } from '../../../../utils/toast';
import { currencyFormat } from '../../../../utils/currencyFormat';
import { CustoTalhao } from '../../../../types/CustoProducao';
import { Select } from '../../../../components/Select';
import { UserContext } from '../../../../components/App';
import { NotAllowed } from '../../../../components/NotAllowed';

type optionType = {
  value: string;
  label: string;
}[];

interface TalhaoCostProps {
  safraIds: string[];
  unit: string;
  safraOptions: optionType;
  rangeDates: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

export function TalhaoCost({ safraIds, unit, rangeDates, safraOptions }: TalhaoCostProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSafra, setSelectedSafra] = useState('_');
  const [talhaoCost, setTalhaoCost] = useState<CustoTalhao>({
    totalCusto: 0,
    totalCustoPorHectare: 0,
    totalCustoTalhao: []
  });

  const { hasPermission } = useContext(UserContext);

  useEffect(() => {
    setSelectedSafra('_');
  }, [safraIds]);

  useEffect(() => {
    async function loadData() {
      if (hasPermission('custo_producao_talhao')) {
        setIsLoading(true);

        if (safraIds.length === 0) {
          setIsLoading(false);
          return;
        }

        if (rangeDates.endDate && rangeDates.startDate && rangeDates.endDate < rangeDates.startDate) {
          setIsLoading(false);
          toast({
            type: 'danger',
            text: 'Data final precisa ser maior que inicial!'
          });
          return;
        }

        const startDateParsed = rangeDates.startDate ? format(rangeDates.startDate, 'dd-MM-yyyy') : '';
        const endDateParsed = rangeDates.endDate ? format(rangeDates.endDate, 'dd-MM-yyyy') : '';

        const talhaoCostData = await CustoProducaoService.findCustoTalhao({
          safraId: selectedSafra === '_' ? safraIds.join(',') : selectedSafra,
          startDate: startDateParsed,
          endDate: endDateParsed,
        });

        setTalhaoCost(talhaoCostData);
      }
      setIsLoading(false);
    }

    loadData();
  }, [selectedSafra, safraIds, rangeDates, hasPermission]);

  return (
    <Container>
      <header>
        <h3>CUSTOS POR TALHÃO (VARIEDADE)</h3>
        {safraOptions.length >= 2 && (
          <Select
            options={[{
              value: '_',
              label: 'Todas as Safras Selecionadas'
            }, ...safraOptions]}
            value={selectedSafra}
            onChange={setSelectedSafra}
            height="40px"
            placeholder='Selecione uma safra'
          />
        )}
      </header>
      <div className="card">
        {!hasPermission('custo_producao_talhao') && <NotAllowed />}
        {isLoading && (
          <Loader>
            <Spinner size={48} />
          </Loader>
        )}
        <header>
          <div className="total">
            <span>
              <strong>{unit === 'hectareCost' ? 'Custo Total/ha: ' : 'Custo Total: '}</strong>
              {unit === 'hectareCost' && currencyFormat(talhaoCost.totalCustoPorHectare)}
              {unit === 'cost' && currencyFormat(talhaoCost.totalCusto)}
              {unit === 'percent' && currencyFormat(talhaoCost.totalCusto)}
            </span>
          </div>
        </header>
        <TalhaoCostChart
          labels={talhaoCost.totalCustoTalhao.map(i => i.talhaoVariedade)}
          safras={talhaoCost.totalCustoTalhao.map(i => i.safra)}
          data={talhaoCost.totalCustoTalhao.map(i => unit === 'cost'
            ? i.total
            : unit === 'hectareCost'
              ? i.totalPorHectare
              : i.porcentagem)}
          unit={unit}
        />
      </div>
    </Container>
  );
}
