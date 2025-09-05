 async function GetData() {
 const res = await fetch('https://psgc.cloud/api/v2/cities-municipalities/0402106000/barangays');
    const items = await res.json();
    console.log(items[0]);
 }