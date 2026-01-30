import { useEffect, useState } from "react";
import { fetchSubmodels } from "../../api/backend";

export default function Home() {
  const [submodels, setSubmodels] = useState([]);

useEffect(() => {
  fetchSubmodels().then(setSubmodels);
}, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Welcome to the SFD Project</h1>

      <p>Congratulations on setting up the SFD GUI project!</p>
      
    </div>
  );
}
