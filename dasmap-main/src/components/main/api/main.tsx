export default async function GetData() {
   const res = await fetch('https://psgc-api.wareneutron.com/api/region');
   const items = await res.json();
   console.log(items[0]);
}