type Row = {
  n: number;
  amp: number;
  phase: number;
  an: number;
  bn: number;
};

type Props = { table: Row[] };

export default function FourierCoeffTable({ table }: Props) {
  return (
    <div className="fourier-table-wrapper">
      <table className="fourier-table">
        <thead>
          <tr>
            <th>n</th>
            <th>|c<sub>n</sub>|</th>
            <th>∠c<sub>n</sub> (°)</th>
            <th>a<sub>n</sub></th>
            <th>b<sub>n</sub></th>
          </tr>
        </thead>
        <tbody>
          {table.map((row) => (
            <tr key={row.n} className={row.n === 0 ? "fourier-table-row-dc" : ""}>
              <td className="fourier-table-n">{row.n}</td>
              <td>{row.amp.toFixed(5)}</td>
              <td>{row.phase.toFixed(1)}</td>
              <td>{row.an.toFixed(5)}</td>
              <td>{row.bn.toFixed(5)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}