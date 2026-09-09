import {UlHero} from '~/components/UlHero';
import {UlStatsBar} from '~/components/UlStatsBar';
import {UlHowItWorks} from '~/components/UlHowItWorks';
import {UlDeliveryRegions} from '~/components/UlDeliveryRegions';
import {useUlReveal} from '~/components/useUlReveal';

/**
 * Home — equivalente a templates/index.json.
 *
 * A ordem das seções é a mesma do "order" do index.json:
 * ul_hero → ul_stats_bar → ul_how_it_works → ul_delivery_regions
 */

export const meta = () => [
  {title: 'Urban Life — Alimentos frescos de hortas urbanas de São Paulo'},
  {
    name: 'description',
    content:
      'Cestas de alimentos frescos de hortas urbanas, com entrega programada por região em São Paulo.',
  },
];

export default function Homepage() {
  useUlReveal();

  return (
    <>
      <UlHero />
      <UlStatsBar />
      <UlHowItWorks />
      <UlDeliveryRegions />
    </>
  );
}
