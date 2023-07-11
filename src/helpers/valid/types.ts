export type VResultSuccess<T = any> = {
  success: true;
  value: T;
};

export type VResultFailure = {
  success: false;
  issues: { type: string; message: string }[];
};

type VResult<T = any> = VResultSuccess<T> | VResultFailure;

type VParseResult<T = any> =
  | {
      status: "aborted";
      reason: string;
    }
  | {
      status: "dirty";
      value: T;
    }
  | {
      status: "valid";
      value: T;
    };

const VDataTypes = {
  String: "string",
  Number: "number",
  Unkown: "unkown",
} as const;
type VDataTypes = (typeof VDataTypes)[keyof typeof VDataTypes];

type VInput<T = unknown> = {
  data: T;
  issues: { type: string; message: string }[];
};

const buildIssue = (error: string) => `Value must ${error}`;

type VInputTypeMap = {
  [VDataTypes.String]: VInput<string>;
  [VDataTypes.Number]: VInput<number>;
  [VDataTypes.Unkown]: VInput;
};

const inputIsOfType = <T extends VDataTypes>(
  input: VInput,
  type: T
): input is VInputTypeMap[T] => {
  return typeof input.data === type;
};

interface VTypeAccessor<T> {
  _type: T;
}

abstract class VType<Type extends VDataTypes, TCheck>
  implements VTypeAccessor<VInputTypeMap[Type]["data"]>
{
  checks!: TCheck[];
  _type!: VInputTypeMap[Type]["data"];

  constructor(checks: TCheck[]) {
    this.checks = checks;
  }

  parse(value: unknown): VResult<VInputTypeMap[Type]["data"]> {
    const input: VInput = {
      data: value,
      issues: [],
    };
    const result = this._parse(input);

    if (result.status === "valid")
      return { success: true, value: result.value };

    return {
      success: false,
      issues:
        result.status === "aborted"
          ? [{ type: "type", message: result.reason }]
          : input.issues,
    };
  }

  abstract _parse(input: VInput): VParseResult<VInputTypeMap[Type]["data"]>;
}

type VNumberCheck =
  | { type: "min"; value: number; errorMsg?: string }
  | { type: "max"; value: number; errorMsg?: string };

class VNumber extends VType<"number", VNumberCheck> {
  _parse(input: VInput): VParseResult<number> {
    if (!inputIsOfType(input, "number")) {
      return {
        status: "aborted",
        reason: buildIssue("be of type number"),
      };
    }

    let status: Exclude<VParseResult["status"], "aborted"> = "valid";
    for (let i = 0; i < this.checks.length; i++) {
      const check = this.checks[i];
      switch (check.type) {
        case "min":
          if (input.data < check.value) {
            input.issues.push({
              type: check.type,
              message:
                check.errorMsg || buildIssue(`be less than ${check.value}`),
            });
            status = "dirty";
          }
          break;
        case "max":
          if (input.data > check.value) {
            input.issues.push({
              type: check.type,
              message:
                check.errorMsg || buildIssue(`be less than ${check.value}`),
            });
            status = "dirty";
          }
          break;
        default:
          throw new Error("Unreachable");
      }
    }

    return { status, value: input.data };
  }

  min(min: number, errorMsg?: string) {
    return new VNumber(
      this.checks.concat({ type: "min", value: min, errorMsg })
    );
  }

  max(max: number, errorMsg?: string) {
    return new VNumber(
      this.checks.concat({ type: "max", value: max, errorMsg })
    );
  }
}

export type VEnumType<Keys extends string> = { [K in Keys]: string };

type VStringCheck =
  | { type: "nonempty"; errorMsg?: string }
  | { type: "enum"; values: VEnumType<string>; errorMsg?: string };

class VString extends VType<"string", VStringCheck> {
  _parse(input: VInput): VParseResult<string> {
    if (!inputIsOfType(input, "string")) {
      return {
        status: "aborted",
        reason: buildIssue("be of type string"),
      };
    }

    let status: Exclude<VParseResult["status"], "aborted"> = "valid";
    for (let i = 0; i < this.checks.length; i++) {
      const check = this.checks[i];
      switch (check.type) {
        case "nonempty":
          if (input.data.length === 0) {
            input.issues.push({
              type: check.type,
              message: check.errorMsg || buildIssue(`be nonempty`),
            });
            status = "dirty";
          }
          break;
        case "enum":
          if (check.values[input.data] === undefined) {
            input.issues.push({
              type: check.type,
              message:
                check.errorMsg ||
                buildIssue(
                  `be one of values ${Object.values(check.values).join(" | ")}`
                ),
            });
            status = "dirty";
          }
          break;
        default:
          throw new Error("Unreachable");
      }
    }

    return { status, value: input.data };
  }

  nonempty(errorMsg?: string) {
    return new VString(this.checks.concat({ type: "nonempty", errorMsg }));
  }

  enum(values: VEnumType<string>, errorMsg?: string) {
    return new VString(this.checks.concat({ type: "enum", values, errorMsg }));
  }
}

type VEnum<T extends string> = VTypeAccessor<T> &
  Pick<VType<"string", any>, "parse">;

type VTypeAny = VType<any, any> | VEnum<string>;
type VRawShapeAny = { [k: string]: VTypeAny };
type VInferType<T extends VTypeAccessor<any>> = T["_type"];
export type { VInferType as infer };

export const number = () => {
  return new VNumber([]);
};
export const string = () => {
  return new VString([]);
};
const enumType = <T extends string>(values: VEnumType<T>) => {
  return string().enum(values) as unknown as VEnum<T>;
};
export { enumType as enum };

class VCollection<
  T extends VRawShapeAny,
  Shape = { [K in keyof T]: T[K]["_type"] },
  Result = { [K in keyof T]: ReturnType<T[K]["parse"]> }
> implements VTypeAccessor<Shape>
{
  _type!: Shape;
  schemas!: T;

  constructor(schemas: T) {
    this.schemas = schemas;
  }

  parse(value: Shape): { success: boolean; params: Result } {
    const result = Object.fromEntries(
      Object.entries(this.schemas).map(([key, schema]) => {
        return [key, schema.parse(value[key as keyof Shape])];
      })
    );
    return {
      success: Object.values(result).reduce((p, r) => p && r.success, true),
      params: result as Result,
    };
  }
}

export const collection = <T extends VRawShapeAny>(
  schemas: T
): VCollection<T> => {
  return new VCollection<T>(schemas);
};
