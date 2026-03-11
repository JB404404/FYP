export default function Home() {
  var location;
  const geolocation = navigator.geolocation;
  console.log(geolocation)
  geolocation?.getCurrentPosition((position)=>{
    location = position;
    console.log(position)
  });
  return (
    <span> {location}  {geolocation==undefined ? "no geo":"geo"}  {navigator==undefined ? "no nav":"nav"}</span>
  )
}
