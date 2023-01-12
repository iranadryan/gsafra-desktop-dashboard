import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../components/App';
import { Loader } from '../../components/Loader';
import FinancialViewsService from '../../services/FinancialViewsService';
import { View } from '../../types/FinancialViews';
import { FinancialView } from './components/FinancialView';
import { Container } from './styles';

export function FinancialViews() {
  const [views, setViews] = useState<View[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { hasPermission } = useContext(UserContext);

  useEffect(() => {
    async function loadData() {
      if (hasPermission('indicadores_financeiros')) {
        const viewsData = await FinancialViewsService.findViews();

        setViews(viewsData);
      }

      setIsLoading(false);
    }

    loadData();
  }, [hasPermission]);

  return (
    <Container>
      <Loader isLoading={isLoading} />
      <header>
        <h1>Indicadores Financeiros</h1>
        <span>
          {`${views.length} ${views.length === 1 ? 'indicador encontrado' : 'indicadores encontrados'}`}
        </span>
      </header>

      <div className="views-grid">
        {hasPermission('indicadores_financeiros') ?
          views.map((view) => (
            <FinancialView key={view.id} {...view} />
          ))
          : (
            <FinancialView id={1} nome="Indicador" situacao={1} periodoPadraoMeses={12} />
          )}
      </div>
    </Container>
  );
}