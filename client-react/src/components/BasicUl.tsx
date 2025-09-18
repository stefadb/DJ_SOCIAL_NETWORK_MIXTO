import type { DbEntity } from "../types/db_types";

type BasicUlProps = {
  entity: DbEntity;
};

function BasicUl(props: BasicUlProps) {
  return (
    <ul>
      {Object.keys(props.entity).map((key) => (
        <li key={key}><b>{key}</b>: {String(props.entity[key])}</li>
      ))}
    </ul>
  );
}

export default BasicUl;
