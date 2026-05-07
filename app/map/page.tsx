import { ReactPromise, Suspense } from 'react';
import ClientMap from './clientMap';


export default async function MapPage({ searchParams }: { searchParams: ReactPromise<any> }) {

  return (
    <Suspense fallback={<div>Loading map...</div>}>
      <div><ClientMap searchParams={await searchParams} /></div>
    </Suspense>
  )
}
