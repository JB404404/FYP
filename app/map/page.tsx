import { ReactPromise } from 'react';
import PagesProxy from './pages-proxy';


export default async function MapPage({ searchParams }: { searchParams: ReactPromise<any> }) {
  const id = (await searchParams).id;


  return (
    <div className='map-proxy-container'>
      <PagesProxy groupId={id}></PagesProxy>
    </div>
  )
}
