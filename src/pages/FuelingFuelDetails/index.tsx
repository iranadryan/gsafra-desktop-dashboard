/* eslint-disable @typescript-eslint/no-explicit-any */
import { format, parse } from 'date-fns';
import { FileXls } from 'phosphor-react';
import { Column } from 'primereact/column';
import { DataTableExpandedRows } from 'primereact/datatable';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WorkBook } from 'xlsx';
import { DateInput } from '../../components/DateInput';
import { Header } from '../../components/Header';
import { Loader } from '../../components/Loader';
import { Select } from '../../components/Select';
import AbastecimentoService from '../../services/AbastecimentoService';
import AlmoxarifadoService from '../../services/AlmoxarifadoService';
import PatrimonioService from '../../services/PatrimonioService';
import TipoPatrimonioService from '../../services/TipoPatrimonioService';
import { DetailsData } from '../../types/Abastecimento';
import { currencyFormat } from '../../utils/currencyFormat';
import { toast } from '../../utils/toast';
import { Container, Table } from './styles';

type optionType = {
  value: string;
  label: string;
}[];

export function FuelingFuelDetails() {
  const [isLoading, setIsLoading] = useState(false);
  const [fuelDetails, setFuelDetails] = useState<DetailsData[]>([]);
  const [patrimonios, setPatrimonios] = useState<optionType>([]);
  const [almoxarifados, setAlmoxarifados] = useState<optionType>([]);
  const [tiposPatrimonio, setTiposPatrimonio] = useState<optionType>([]);
  const [expandedRows, setExpandedRows] = useState<any[] | DataTableExpandedRows>([]);
  const custos: optionType = [
    { value: 'medio', label: 'Custo Médio' },
    { value: 'atual', label: 'Custo Atual' },
  ];

  const [query] = useSearchParams();
  const custoParam = query.get('custo') as string;
  const startDateParam = query.get('startDate') as string;
  const endDateParam = query.get('endDate') as string;
  const patrimonioParam = query.get('idPatrimonio') as string;
  const almoxarifadoParam = query.get('idAlmoxarifado') as string;
  const tipoPatrimonioParam = query.get('idTipoPatrimonio') as string;

  const [startDate, setStartDate] = useState<Date | null>(
    startDateParam === '_' ? null : parse(startDateParam, 'dd-MM-yyyy', new Date())
  );
  const [endDate, setEndDate] = useState<Date | null>(
    endDateParam === '_' ? null : parse(endDateParam, 'dd-MM-yyyy', new Date())
  );
  const [selectedPatrimonio, setSelectedPatrimonio] = useState(patrimonioParam);
  const [selectedAlmoxarifado, setSelectedAlmoxarifado] = useState(almoxarifadoParam);
  const [selectedTipoPatrimonio, setSelectedTipoPatrimonio] = useState(tipoPatrimonioParam);
  const [selectedCusto, setSelectedCusto] = useState(custoParam);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      const [
        patrimoniosData,
        almoxarifadosData,
        tiposPatrimonioData
      ] = await Promise.all([
        PatrimonioService.findPatrimonios(),
        AlmoxarifadoService.findAlmoxarifados(),
        TipoPatrimonioService.findTiposPatrimonio()
      ]);

      const patrimoniosOptions = patrimoniosData.map(item => (
        { value: String(item.id), label: item.descricao }
      ));
      patrimoniosOptions.unshift({ value: '_', label: 'Todos' });

      const almoxarifadosOptions = almoxarifadosData.map(item => (
        { value: String(item.id), label: item.nome }
      ));
      almoxarifadosOptions.unshift({ value: '_', label: 'Todos' });

      const tiposPatrimonioOptions = tiposPatrimonioData.map(item => (
        { value: String(item.id), label: item.nome }
      ));
      tiposPatrimonioOptions.unshift({ value: '_', label: 'Todos' });

      setPatrimonios(patrimoniosOptions);
      setAlmoxarifados(almoxarifadosOptions);
      setTiposPatrimonio(tiposPatrimonioOptions);

      setIsLoading(false);
    }

    loadData();
  }, []);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      if (endDate && startDate && endDate < startDate) {
        setIsLoading(false);
        toast({
          type: 'danger',
          text: 'Data final precisa ser maior que inicial!'
        });
        return;
      }

      const fuelDetailsData = await AbastecimentoService.findDetails({
        custo: selectedCusto,
        startDate: startDate ? format(startDate, 'dd-MM-yyyy') : '',
        endDate: endDate ? format(endDate, 'dd-MM-yyyy') : '',
        idPatrimonio: selectedPatrimonio !== '_' ? selectedPatrimonio : undefined,
        idAlmoxarifado: selectedAlmoxarifado !== '_' ? selectedAlmoxarifado : undefined,
        idTipoPatrimonio: selectedTipoPatrimonio !== '_' ? selectedTipoPatrimonio : undefined,
      });

      setFuelDetails(fuelDetailsData);

      setIsLoading(false);
    }

    loadData();
  }, [selectedCusto, startDate, endDate, selectedPatrimonio, selectedAlmoxarifado, selectedTipoPatrimonio]);

  function formatNumber(number: number) {
    return `${new Intl.NumberFormat('id').format(number)} lts`;
  }

  function handleExportExcel() {
    import('xlsx').then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(fuelDetails.map(i => ({
        'DATA': format(new Date(i.data), 'dd/MM/yyyy'),
        'NUMERO REQUISICAO': i.numeroRequisicao,
        'PATRIMONIO': i.patrimonio,
        'COMBUSTIVEL': i.combustivel,
        'LOCAL DE SAIDA': i.localSaida,
        'LITROS': i.quantidade,
        'CUSTO POR LITRO': i.custoIndividual,
        'TOTAL': i.total,
      })));

      for (let i = 2; i <= fuelDetails.length + 1; i++) {
        worksheet[`A${i}`].z = 'dd"/"mm"/"yyyy';
        worksheet[`G${i}`].z = '[$R$]#,##0.00';
        worksheet[`H${i}`].z = '[$R$]#,##0.00';
      }

      const workbook: WorkBook = {
        Sheets: { 'Movimentos de Conta': worksheet },
        SheetNames: ['Movimentos de Conta'],
      };
      workbook.Props = {
        Author: 'GSafra Software',
      };
      const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      saveAsExcelFile(
        excelBuffer,
        `RESUMO POR COMBUSTIVEL ${startDate ? format(startDate, 'dd-MM-yyyy') : '-'
        } À ${endDate ? format(endDate, 'dd-MM-yyyy') : '-'}`
      );
    });
  }

  function saveAsExcelFile(buffer: any, fileName: string) {
    import('file-saver').then(module => {
      if (module && module.default) {
        const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const EXCEL_EXTENSION = '.xlsx';
        const data = new Blob([buffer], {
          type: EXCEL_TYPE
        });

        module.default.saveAs(data, fileName + EXCEL_EXTENSION);
      }
    });
  }

  return (
    <Container>
      <Loader isLoading={isLoading} />
      <Header
        title="Resumo por Combustível"
        subtitle="VISÃO ANALÍTICA"
        canGoBack
      />
      <div className="filters">
        <div className="date-filter">
          <DateInput
            onChangeDate={(date) => setStartDate(date)}
            placeholder='Data Inicial'
            defaultDate={startDateParam === '_' ? null : parse(startDateParam, 'dd-MM-yyyy', new Date())}
            height="48px"
            width="100%"
            fontSize="16px"
            horizontalPadding="12px"
            label="Data Inicial"
          />
          <strong>à</strong>
          <DateInput
            onChangeDate={(date) => setEndDate(date)}
            placeholder='Data Final'
            defaultDate={endDateParam === '_' ? null : parse(endDateParam, 'dd-MM-yyyy', new Date())}
            height="48px"
            width="100%"
            fontSize="16px"
            horizontalPadding="12px"
            label="Data Final"
          />
        </div>

        <Select
          options={patrimonios}
          value={selectedPatrimonio}
          onChange={setSelectedPatrimonio}
          placeholder="Patrimonio"
          label="Patrimonio"
          noOptionsMessage="0 patrimonios encontrados"
          width="100%"
        />

        <Select
          options={almoxarifados}
          value={selectedAlmoxarifado}
          onChange={setSelectedAlmoxarifado}
          placeholder="Local de Saída"
          label="Local de Saída"
          noOptionsMessage="0 locais de saída encontrados"
          width="100%"
        />

        <Select
          options={custos}
          value={selectedCusto}
          onChange={setSelectedCusto}
          placeholder="Custo do Combustível"
          label="Custo do Combustível"
          width="100%"
        />

        <Select
          options={tiposPatrimonio}
          value={selectedTipoPatrimonio}
          onChange={setSelectedTipoPatrimonio}
          placeholder="Tipo de Patrimônio"
          label="Tipo de Patrimônio"
          noOptionsMessage="0 tipos de patrimônio encontrados"
          width="100%"
        />
      </div>
      <button className="export-button" onClick={handleExportExcel}>
        <FileXls size={24} color="#F7FBFE" weight="regular" />
      </button>
      <Table
        value={fuelDetails}
        rowGroupMode="subheader"
        groupRowsBy="combustivel"
        sortMode="single"
        sortField="combustivel"
        sortOrder={1}
        responsiveLayout="scroll"
        expandableRowGroups
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowGroupHeaderTemplate={(data) => (
          <strong>{data.combustivel}</strong>
        )}
        emptyMessage="Nenhum dado encontrado"
      >
        <Column field="data" header="Data" body={(rowData) => format(new Date(rowData.data), 'dd/MM/yyyy')} />
        {/* <Column field="numeroRequisicao" header="Requisição" /> */}
        <Column field="patrimonio" header="Patrimônio" />
        {/* <Column field="combustivel" header="Combustível" /> */}
        <Column field="localSaida" header="Local" />
        <Column field="quantidade" header="Litros" body={(rowData) => formatNumber(rowData.quantidade)} />
        <Column field="custoIndividual" header="Custo por Litro" body={(rowData) => currencyFormat(rowData.custoIndividual)} />
        <Column field="total" header="Total" body={(rowData) => currencyFormat(rowData.total)} />
      </Table>
    </Container>
  );
}
