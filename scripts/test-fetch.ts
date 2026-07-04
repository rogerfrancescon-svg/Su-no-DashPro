async function test() {
  const res = await fetch("http://localhost:3000/api/visits");
  const data = await res.json();
  console.log("Visits fetch sample:", data.slice(0, 2));
}
test();
