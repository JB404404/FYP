import { ReactPromise } from 'react';
import PagesProxy from './pages-proxy';


export default async function MapPage({ searchParams }: { searchParams: ReactPromise<any> }) {

  return (
    <div>
      <PagesProxy searchParams={await searchParams}></PagesProxy>
    </div>
  )
}
