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

      <p>
        The Smart Flow Digitalization (SFD) Project provides a unified platform
        for modeling, managing, and analyzing energy networks using digital twins
        based on the Asset Administration Shell concept.
      </p>

      <h2>Available AAS</h2>
      <ul>
        {submodels.map((sm) => (
          <li key={sm.id}>{sm.idShort}</li>
        ))}
      </ul>
    </div>
  );
}
