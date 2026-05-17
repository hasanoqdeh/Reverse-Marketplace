
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model UserProfile
 * 
 */
export type UserProfile = $Result.DefaultSelection<Prisma.$UserProfilePayload>
/**
 * Model AuthToken
 * 
 */
export type AuthToken = $Result.DefaultSelection<Prisma.$AuthTokenPayload>
/**
 * Model RequestCategory
 * 
 */
export type RequestCategory = $Result.DefaultSelection<Prisma.$RequestCategoryPayload>
/**
 * Model Request
 * 
 */
export type Request = $Result.DefaultSelection<Prisma.$RequestPayload>
/**
 * Model RequestImage
 * 
 */
export type RequestImage = $Result.DefaultSelection<Prisma.$RequestImagePayload>
/**
 * Model RequestDraft
 * 
 */
export type RequestDraft = $Result.DefaultSelection<Prisma.$RequestDraftPayload>
/**
 * Model RequestExtension
 * 
 */
export type RequestExtension = $Result.DefaultSelection<Prisma.$RequestExtensionPayload>
/**
 * Model RequestSearchIndex
 * 
 */
export type RequestSearchIndex = $Result.DefaultSelection<Prisma.$RequestSearchIndexPayload>
/**
 * Model SavedSearch
 * 
 */
export type SavedSearch = $Result.DefaultSelection<Prisma.$SavedSearchPayload>
/**
 * Model Bid
 * 
 */
export type Bid = $Result.DefaultSelection<Prisma.$BidPayload>
/**
 * Model BidTemplate
 * 
 */
export type BidTemplate = $Result.DefaultSelection<Prisma.$BidTemplatePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UserRole: {
  BUYER: 'BUYER',
  MERCHANT: 'MERCHANT',
  ADMIN: 'ADMIN'
};

export type UserRole = (typeof UserRole)[keyof typeof UserRole]


export const UserStatus: {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  BANNED: 'BANNED',
  SUSPENDED: 'SUSPENDED'
};

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus]


export const AdminSubRole: {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  SUPPORT: 'SUPPORT'
};

export type AdminSubRole = (typeof AdminSubRole)[keyof typeof AdminSubRole]


export const TokenType: {
  ACCESS: 'ACCESS',
  REFRESH: 'REFRESH'
};

export type TokenType = (typeof TokenType)[keyof typeof TokenType]


export const RequestStatus: {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  HAS_BIDS: 'HAS_BIDS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED'
};

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus]


export const BidStatus: {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  WITHDRAWN: 'WITHDRAWN'
};

export type BidStatus = (typeof BidStatus)[keyof typeof BidStatus]


export const AmountType: {
  FIXED: 'FIXED',
  PERCENTAGE: 'PERCENTAGE',
  RANGE: 'RANGE'
};

export type AmountType = (typeof AmountType)[keyof typeof AmountType]

}

export type UserRole = $Enums.UserRole

export const UserRole: typeof $Enums.UserRole

export type UserStatus = $Enums.UserStatus

export const UserStatus: typeof $Enums.UserStatus

export type AdminSubRole = $Enums.AdminSubRole

export const AdminSubRole: typeof $Enums.AdminSubRole

export type TokenType = $Enums.TokenType

export const TokenType: typeof $Enums.TokenType

export type RequestStatus = $Enums.RequestStatus

export const RequestStatus: typeof $Enums.RequestStatus

export type BidStatus = $Enums.BidStatus

export const BidStatus: typeof $Enums.BidStatus

export type AmountType = $Enums.AmountType

export const AmountType: typeof $Enums.AmountType

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.userProfile`: Exposes CRUD operations for the **UserProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserProfiles
    * const userProfiles = await prisma.userProfile.findMany()
    * ```
    */
  get userProfile(): Prisma.UserProfileDelegate<ExtArgs>;

  /**
   * `prisma.authToken`: Exposes CRUD operations for the **AuthToken** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AuthTokens
    * const authTokens = await prisma.authToken.findMany()
    * ```
    */
  get authToken(): Prisma.AuthTokenDelegate<ExtArgs>;

  /**
   * `prisma.requestCategory`: Exposes CRUD operations for the **RequestCategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RequestCategories
    * const requestCategories = await prisma.requestCategory.findMany()
    * ```
    */
  get requestCategory(): Prisma.RequestCategoryDelegate<ExtArgs>;

  /**
   * `prisma.request`: Exposes CRUD operations for the **Request** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Requests
    * const requests = await prisma.request.findMany()
    * ```
    */
  get request(): Prisma.RequestDelegate<ExtArgs>;

  /**
   * `prisma.requestImage`: Exposes CRUD operations for the **RequestImage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RequestImages
    * const requestImages = await prisma.requestImage.findMany()
    * ```
    */
  get requestImage(): Prisma.RequestImageDelegate<ExtArgs>;

  /**
   * `prisma.requestDraft`: Exposes CRUD operations for the **RequestDraft** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RequestDrafts
    * const requestDrafts = await prisma.requestDraft.findMany()
    * ```
    */
  get requestDraft(): Prisma.RequestDraftDelegate<ExtArgs>;

  /**
   * `prisma.requestExtension`: Exposes CRUD operations for the **RequestExtension** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RequestExtensions
    * const requestExtensions = await prisma.requestExtension.findMany()
    * ```
    */
  get requestExtension(): Prisma.RequestExtensionDelegate<ExtArgs>;

  /**
   * `prisma.requestSearchIndex`: Exposes CRUD operations for the **RequestSearchIndex** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RequestSearchIndices
    * const requestSearchIndices = await prisma.requestSearchIndex.findMany()
    * ```
    */
  get requestSearchIndex(): Prisma.RequestSearchIndexDelegate<ExtArgs>;

  /**
   * `prisma.savedSearch`: Exposes CRUD operations for the **SavedSearch** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SavedSearches
    * const savedSearches = await prisma.savedSearch.findMany()
    * ```
    */
  get savedSearch(): Prisma.SavedSearchDelegate<ExtArgs>;

  /**
   * `prisma.bid`: Exposes CRUD operations for the **Bid** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Bids
    * const bids = await prisma.bid.findMany()
    * ```
    */
  get bid(): Prisma.BidDelegate<ExtArgs>;

  /**
   * `prisma.bidTemplate`: Exposes CRUD operations for the **BidTemplate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BidTemplates
    * const bidTemplates = await prisma.bidTemplate.findMany()
    * ```
    */
  get bidTemplate(): Prisma.BidTemplateDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    UserProfile: 'UserProfile',
    AuthToken: 'AuthToken',
    RequestCategory: 'RequestCategory',
    Request: 'Request',
    RequestImage: 'RequestImage',
    RequestDraft: 'RequestDraft',
    RequestExtension: 'RequestExtension',
    RequestSearchIndex: 'RequestSearchIndex',
    SavedSearch: 'SavedSearch',
    Bid: 'Bid',
    BidTemplate: 'BidTemplate'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "user" | "userProfile" | "authToken" | "requestCategory" | "request" | "requestImage" | "requestDraft" | "requestExtension" | "requestSearchIndex" | "savedSearch" | "bid" | "bidTemplate"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      UserProfile: {
        payload: Prisma.$UserProfilePayload<ExtArgs>
        fields: Prisma.UserProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          findFirst: {
            args: Prisma.UserProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          findMany: {
            args: Prisma.UserProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>[]
          }
          create: {
            args: Prisma.UserProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          createMany: {
            args: Prisma.UserProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>[]
          }
          delete: {
            args: Prisma.UserProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          update: {
            args: Prisma.UserProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          deleteMany: {
            args: Prisma.UserProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          aggregate: {
            args: Prisma.UserProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserProfile>
          }
          groupBy: {
            args: Prisma.UserProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserProfileCountArgs<ExtArgs>
            result: $Utils.Optional<UserProfileCountAggregateOutputType> | number
          }
        }
      }
      AuthToken: {
        payload: Prisma.$AuthTokenPayload<ExtArgs>
        fields: Prisma.AuthTokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AuthTokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthTokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AuthTokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthTokenPayload>
          }
          findFirst: {
            args: Prisma.AuthTokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthTokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AuthTokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthTokenPayload>
          }
          findMany: {
            args: Prisma.AuthTokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthTokenPayload>[]
          }
          create: {
            args: Prisma.AuthTokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthTokenPayload>
          }
          createMany: {
            args: Prisma.AuthTokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AuthTokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthTokenPayload>[]
          }
          delete: {
            args: Prisma.AuthTokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthTokenPayload>
          }
          update: {
            args: Prisma.AuthTokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthTokenPayload>
          }
          deleteMany: {
            args: Prisma.AuthTokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AuthTokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AuthTokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AuthTokenPayload>
          }
          aggregate: {
            args: Prisma.AuthTokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAuthToken>
          }
          groupBy: {
            args: Prisma.AuthTokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<AuthTokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.AuthTokenCountArgs<ExtArgs>
            result: $Utils.Optional<AuthTokenCountAggregateOutputType> | number
          }
        }
      }
      RequestCategory: {
        payload: Prisma.$RequestCategoryPayload<ExtArgs>
        fields: Prisma.RequestCategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RequestCategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestCategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RequestCategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestCategoryPayload>
          }
          findFirst: {
            args: Prisma.RequestCategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestCategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RequestCategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestCategoryPayload>
          }
          findMany: {
            args: Prisma.RequestCategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestCategoryPayload>[]
          }
          create: {
            args: Prisma.RequestCategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestCategoryPayload>
          }
          createMany: {
            args: Prisma.RequestCategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RequestCategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestCategoryPayload>[]
          }
          delete: {
            args: Prisma.RequestCategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestCategoryPayload>
          }
          update: {
            args: Prisma.RequestCategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestCategoryPayload>
          }
          deleteMany: {
            args: Prisma.RequestCategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RequestCategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RequestCategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestCategoryPayload>
          }
          aggregate: {
            args: Prisma.RequestCategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRequestCategory>
          }
          groupBy: {
            args: Prisma.RequestCategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<RequestCategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.RequestCategoryCountArgs<ExtArgs>
            result: $Utils.Optional<RequestCategoryCountAggregateOutputType> | number
          }
        }
      }
      Request: {
        payload: Prisma.$RequestPayload<ExtArgs>
        fields: Prisma.RequestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RequestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RequestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestPayload>
          }
          findFirst: {
            args: Prisma.RequestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RequestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestPayload>
          }
          findMany: {
            args: Prisma.RequestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestPayload>[]
          }
          create: {
            args: Prisma.RequestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestPayload>
          }
          createMany: {
            args: Prisma.RequestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RequestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestPayload>[]
          }
          delete: {
            args: Prisma.RequestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestPayload>
          }
          update: {
            args: Prisma.RequestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestPayload>
          }
          deleteMany: {
            args: Prisma.RequestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RequestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RequestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestPayload>
          }
          aggregate: {
            args: Prisma.RequestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRequest>
          }
          groupBy: {
            args: Prisma.RequestGroupByArgs<ExtArgs>
            result: $Utils.Optional<RequestGroupByOutputType>[]
          }
          count: {
            args: Prisma.RequestCountArgs<ExtArgs>
            result: $Utils.Optional<RequestCountAggregateOutputType> | number
          }
        }
      }
      RequestImage: {
        payload: Prisma.$RequestImagePayload<ExtArgs>
        fields: Prisma.RequestImageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RequestImageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestImagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RequestImageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestImagePayload>
          }
          findFirst: {
            args: Prisma.RequestImageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestImagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RequestImageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestImagePayload>
          }
          findMany: {
            args: Prisma.RequestImageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestImagePayload>[]
          }
          create: {
            args: Prisma.RequestImageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestImagePayload>
          }
          createMany: {
            args: Prisma.RequestImageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RequestImageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestImagePayload>[]
          }
          delete: {
            args: Prisma.RequestImageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestImagePayload>
          }
          update: {
            args: Prisma.RequestImageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestImagePayload>
          }
          deleteMany: {
            args: Prisma.RequestImageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RequestImageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RequestImageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestImagePayload>
          }
          aggregate: {
            args: Prisma.RequestImageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRequestImage>
          }
          groupBy: {
            args: Prisma.RequestImageGroupByArgs<ExtArgs>
            result: $Utils.Optional<RequestImageGroupByOutputType>[]
          }
          count: {
            args: Prisma.RequestImageCountArgs<ExtArgs>
            result: $Utils.Optional<RequestImageCountAggregateOutputType> | number
          }
        }
      }
      RequestDraft: {
        payload: Prisma.$RequestDraftPayload<ExtArgs>
        fields: Prisma.RequestDraftFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RequestDraftFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestDraftPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RequestDraftFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestDraftPayload>
          }
          findFirst: {
            args: Prisma.RequestDraftFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestDraftPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RequestDraftFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestDraftPayload>
          }
          findMany: {
            args: Prisma.RequestDraftFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestDraftPayload>[]
          }
          create: {
            args: Prisma.RequestDraftCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestDraftPayload>
          }
          createMany: {
            args: Prisma.RequestDraftCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RequestDraftCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestDraftPayload>[]
          }
          delete: {
            args: Prisma.RequestDraftDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestDraftPayload>
          }
          update: {
            args: Prisma.RequestDraftUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestDraftPayload>
          }
          deleteMany: {
            args: Prisma.RequestDraftDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RequestDraftUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RequestDraftUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestDraftPayload>
          }
          aggregate: {
            args: Prisma.RequestDraftAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRequestDraft>
          }
          groupBy: {
            args: Prisma.RequestDraftGroupByArgs<ExtArgs>
            result: $Utils.Optional<RequestDraftGroupByOutputType>[]
          }
          count: {
            args: Prisma.RequestDraftCountArgs<ExtArgs>
            result: $Utils.Optional<RequestDraftCountAggregateOutputType> | number
          }
        }
      }
      RequestExtension: {
        payload: Prisma.$RequestExtensionPayload<ExtArgs>
        fields: Prisma.RequestExtensionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RequestExtensionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestExtensionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RequestExtensionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestExtensionPayload>
          }
          findFirst: {
            args: Prisma.RequestExtensionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestExtensionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RequestExtensionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestExtensionPayload>
          }
          findMany: {
            args: Prisma.RequestExtensionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestExtensionPayload>[]
          }
          create: {
            args: Prisma.RequestExtensionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestExtensionPayload>
          }
          createMany: {
            args: Prisma.RequestExtensionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RequestExtensionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestExtensionPayload>[]
          }
          delete: {
            args: Prisma.RequestExtensionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestExtensionPayload>
          }
          update: {
            args: Prisma.RequestExtensionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestExtensionPayload>
          }
          deleteMany: {
            args: Prisma.RequestExtensionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RequestExtensionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RequestExtensionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestExtensionPayload>
          }
          aggregate: {
            args: Prisma.RequestExtensionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRequestExtension>
          }
          groupBy: {
            args: Prisma.RequestExtensionGroupByArgs<ExtArgs>
            result: $Utils.Optional<RequestExtensionGroupByOutputType>[]
          }
          count: {
            args: Prisma.RequestExtensionCountArgs<ExtArgs>
            result: $Utils.Optional<RequestExtensionCountAggregateOutputType> | number
          }
        }
      }
      RequestSearchIndex: {
        payload: Prisma.$RequestSearchIndexPayload<ExtArgs>
        fields: Prisma.RequestSearchIndexFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RequestSearchIndexFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestSearchIndexPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RequestSearchIndexFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestSearchIndexPayload>
          }
          findFirst: {
            args: Prisma.RequestSearchIndexFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestSearchIndexPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RequestSearchIndexFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestSearchIndexPayload>
          }
          findMany: {
            args: Prisma.RequestSearchIndexFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestSearchIndexPayload>[]
          }
          create: {
            args: Prisma.RequestSearchIndexCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestSearchIndexPayload>
          }
          createMany: {
            args: Prisma.RequestSearchIndexCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RequestSearchIndexCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestSearchIndexPayload>[]
          }
          delete: {
            args: Prisma.RequestSearchIndexDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestSearchIndexPayload>
          }
          update: {
            args: Prisma.RequestSearchIndexUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestSearchIndexPayload>
          }
          deleteMany: {
            args: Prisma.RequestSearchIndexDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RequestSearchIndexUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RequestSearchIndexUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RequestSearchIndexPayload>
          }
          aggregate: {
            args: Prisma.RequestSearchIndexAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRequestSearchIndex>
          }
          groupBy: {
            args: Prisma.RequestSearchIndexGroupByArgs<ExtArgs>
            result: $Utils.Optional<RequestSearchIndexGroupByOutputType>[]
          }
          count: {
            args: Prisma.RequestSearchIndexCountArgs<ExtArgs>
            result: $Utils.Optional<RequestSearchIndexCountAggregateOutputType> | number
          }
        }
      }
      SavedSearch: {
        payload: Prisma.$SavedSearchPayload<ExtArgs>
        fields: Prisma.SavedSearchFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SavedSearchFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedSearchPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SavedSearchFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedSearchPayload>
          }
          findFirst: {
            args: Prisma.SavedSearchFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedSearchPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SavedSearchFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedSearchPayload>
          }
          findMany: {
            args: Prisma.SavedSearchFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedSearchPayload>[]
          }
          create: {
            args: Prisma.SavedSearchCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedSearchPayload>
          }
          createMany: {
            args: Prisma.SavedSearchCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SavedSearchCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedSearchPayload>[]
          }
          delete: {
            args: Prisma.SavedSearchDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedSearchPayload>
          }
          update: {
            args: Prisma.SavedSearchUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedSearchPayload>
          }
          deleteMany: {
            args: Prisma.SavedSearchDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SavedSearchUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SavedSearchUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SavedSearchPayload>
          }
          aggregate: {
            args: Prisma.SavedSearchAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSavedSearch>
          }
          groupBy: {
            args: Prisma.SavedSearchGroupByArgs<ExtArgs>
            result: $Utils.Optional<SavedSearchGroupByOutputType>[]
          }
          count: {
            args: Prisma.SavedSearchCountArgs<ExtArgs>
            result: $Utils.Optional<SavedSearchCountAggregateOutputType> | number
          }
        }
      }
      Bid: {
        payload: Prisma.$BidPayload<ExtArgs>
        fields: Prisma.BidFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BidFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BidFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>
          }
          findFirst: {
            args: Prisma.BidFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BidFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>
          }
          findMany: {
            args: Prisma.BidFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>[]
          }
          create: {
            args: Prisma.BidCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>
          }
          createMany: {
            args: Prisma.BidCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BidCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>[]
          }
          delete: {
            args: Prisma.BidDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>
          }
          update: {
            args: Prisma.BidUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>
          }
          deleteMany: {
            args: Prisma.BidDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BidUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BidUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidPayload>
          }
          aggregate: {
            args: Prisma.BidAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBid>
          }
          groupBy: {
            args: Prisma.BidGroupByArgs<ExtArgs>
            result: $Utils.Optional<BidGroupByOutputType>[]
          }
          count: {
            args: Prisma.BidCountArgs<ExtArgs>
            result: $Utils.Optional<BidCountAggregateOutputType> | number
          }
        }
      }
      BidTemplate: {
        payload: Prisma.$BidTemplatePayload<ExtArgs>
        fields: Prisma.BidTemplateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BidTemplateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidTemplatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BidTemplateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidTemplatePayload>
          }
          findFirst: {
            args: Prisma.BidTemplateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidTemplatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BidTemplateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidTemplatePayload>
          }
          findMany: {
            args: Prisma.BidTemplateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidTemplatePayload>[]
          }
          create: {
            args: Prisma.BidTemplateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidTemplatePayload>
          }
          createMany: {
            args: Prisma.BidTemplateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BidTemplateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidTemplatePayload>[]
          }
          delete: {
            args: Prisma.BidTemplateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidTemplatePayload>
          }
          update: {
            args: Prisma.BidTemplateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidTemplatePayload>
          }
          deleteMany: {
            args: Prisma.BidTemplateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BidTemplateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BidTemplateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BidTemplatePayload>
          }
          aggregate: {
            args: Prisma.BidTemplateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBidTemplate>
          }
          groupBy: {
            args: Prisma.BidTemplateGroupByArgs<ExtArgs>
            result: $Utils.Optional<BidTemplateGroupByOutputType>[]
          }
          count: {
            args: Prisma.BidTemplateCountArgs<ExtArgs>
            result: $Utils.Optional<BidTemplateCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    authTokens: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    authTokens?: boolean | UserCountOutputTypeCountAuthTokensArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountAuthTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthTokenWhereInput
  }


  /**
   * Count Type RequestCategoryCountOutputType
   */

  export type RequestCategoryCountOutputType = {
    children: number
    requests: number
    drafts: number
  }

  export type RequestCategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    children?: boolean | RequestCategoryCountOutputTypeCountChildrenArgs
    requests?: boolean | RequestCategoryCountOutputTypeCountRequestsArgs
    drafts?: boolean | RequestCategoryCountOutputTypeCountDraftsArgs
  }

  // Custom InputTypes
  /**
   * RequestCategoryCountOutputType without action
   */
  export type RequestCategoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategoryCountOutputType
     */
    select?: RequestCategoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RequestCategoryCountOutputType without action
   */
  export type RequestCategoryCountOutputTypeCountChildrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequestCategoryWhereInput
  }

  /**
   * RequestCategoryCountOutputType without action
   */
  export type RequestCategoryCountOutputTypeCountRequestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequestWhereInput
  }

  /**
   * RequestCategoryCountOutputType without action
   */
  export type RequestCategoryCountOutputTypeCountDraftsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequestDraftWhereInput
  }


  /**
   * Count Type RequestCountOutputType
   */

  export type RequestCountOutputType = {
    images: number
    extensions: number
  }

  export type RequestCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    images?: boolean | RequestCountOutputTypeCountImagesArgs
    extensions?: boolean | RequestCountOutputTypeCountExtensionsArgs
  }

  // Custom InputTypes
  /**
   * RequestCountOutputType without action
   */
  export type RequestCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCountOutputType
     */
    select?: RequestCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RequestCountOutputType without action
   */
  export type RequestCountOutputTypeCountImagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequestImageWhereInput
  }

  /**
   * RequestCountOutputType without action
   */
  export type RequestCountOutputTypeCountExtensionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequestExtensionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    failedLoginAttempts: number | null
  }

  export type UserSumAggregateOutputType = {
    failedLoginAttempts: number | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    phone: string | null
    role: $Enums.UserRole | null
    status: $Enums.UserStatus | null
    phoneVerified: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    lastLoginAt: Date | null
    failedLoginAttempts: number | null
    lockedUntil: Date | null
    adminSubRole: $Enums.AdminSubRole | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    phone: string | null
    role: $Enums.UserRole | null
    status: $Enums.UserStatus | null
    phoneVerified: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    lastLoginAt: Date | null
    failedLoginAttempts: number | null
    lockedUntil: Date | null
    adminSubRole: $Enums.AdminSubRole | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    phone: number
    role: number
    status: number
    phoneVerified: number
    createdAt: number
    updatedAt: number
    lastLoginAt: number
    failedLoginAttempts: number
    lockedUntil: number
    adminSubRole: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    failedLoginAttempts?: true
  }

  export type UserSumAggregateInputType = {
    failedLoginAttempts?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    phone?: true
    role?: true
    status?: true
    phoneVerified?: true
    createdAt?: true
    updatedAt?: true
    lastLoginAt?: true
    failedLoginAttempts?: true
    lockedUntil?: true
    adminSubRole?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    phone?: true
    role?: true
    status?: true
    phoneVerified?: true
    createdAt?: true
    updatedAt?: true
    lastLoginAt?: true
    failedLoginAttempts?: true
    lockedUntil?: true
    adminSubRole?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    phone?: true
    role?: true
    status?: true
    phoneVerified?: true
    createdAt?: true
    updatedAt?: true
    lastLoginAt?: true
    failedLoginAttempts?: true
    lockedUntil?: true
    adminSubRole?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    phone: string
    role: $Enums.UserRole
    status: $Enums.UserStatus
    phoneVerified: boolean
    createdAt: Date
    updatedAt: Date
    lastLoginAt: Date | null
    failedLoginAttempts: number
    lockedUntil: Date | null
    adminSubRole: $Enums.AdminSubRole | null
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phone?: boolean
    role?: boolean
    status?: boolean
    phoneVerified?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
    failedLoginAttempts?: boolean
    lockedUntil?: boolean
    adminSubRole?: boolean
    profile?: boolean | User$profileArgs<ExtArgs>
    authTokens?: boolean | User$authTokensArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phone?: boolean
    role?: boolean
    status?: boolean
    phoneVerified?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
    failedLoginAttempts?: boolean
    lockedUntil?: boolean
    adminSubRole?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    phone?: boolean
    role?: boolean
    status?: boolean
    phoneVerified?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    lastLoginAt?: boolean
    failedLoginAttempts?: boolean
    lockedUntil?: boolean
    adminSubRole?: boolean
  }

  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    profile?: boolean | User$profileArgs<ExtArgs>
    authTokens?: boolean | User$authTokensArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      profile: Prisma.$UserProfilePayload<ExtArgs> | null
      authTokens: Prisma.$AuthTokenPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      phone: string
      role: $Enums.UserRole
      status: $Enums.UserStatus
      phoneVerified: boolean
      createdAt: Date
      updatedAt: Date
      lastLoginAt: Date | null
      failedLoginAttempts: number
      lockedUntil: Date | null
      adminSubRole: $Enums.AdminSubRole | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    profile<T extends User$profileArgs<ExtArgs> = {}>(args?: Subset<T, User$profileArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    authTokens<T extends User$authTokensArgs<ExtArgs> = {}>(args?: Subset<T, User$authTokensArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthTokenPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'UserRole'>
    readonly status: FieldRef<"User", 'UserStatus'>
    readonly phoneVerified: FieldRef<"User", 'Boolean'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly lastLoginAt: FieldRef<"User", 'DateTime'>
    readonly failedLoginAttempts: FieldRef<"User", 'Int'>
    readonly lockedUntil: FieldRef<"User", 'DateTime'>
    readonly adminSubRole: FieldRef<"User", 'AdminSubRole'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User.profile
   */
  export type User$profileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    where?: UserProfileWhereInput
  }

  /**
   * User.authTokens
   */
  export type User$authTokensArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthToken
     */
    select?: AuthTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthTokenInclude<ExtArgs> | null
    where?: AuthTokenWhereInput
    orderBy?: AuthTokenOrderByWithRelationInput | AuthTokenOrderByWithRelationInput[]
    cursor?: AuthTokenWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AuthTokenScalarFieldEnum | AuthTokenScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model UserProfile
   */

  export type AggregateUserProfile = {
    _count: UserProfileCountAggregateOutputType | null
    _avg: UserProfileAvgAggregateOutputType | null
    _sum: UserProfileSumAggregateOutputType | null
    _min: UserProfileMinAggregateOutputType | null
    _max: UserProfileMaxAggregateOutputType | null
  }

  export type UserProfileAvgAggregateOutputType = {
    locationLat: Decimal | null
    locationLng: Decimal | null
  }

  export type UserProfileSumAggregateOutputType = {
    locationLat: Decimal | null
    locationLng: Decimal | null
  }

  export type UserProfileMinAggregateOutputType = {
    id: string | null
    userId: string | null
    firstName: string | null
    lastName: string | null
    profileImageUrl: string | null
    locationLat: Decimal | null
    locationLng: Decimal | null
    address: string | null
    city: string | null
    country: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserProfileMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    firstName: string | null
    lastName: string | null
    profileImageUrl: string | null
    locationLat: Decimal | null
    locationLng: Decimal | null
    address: string | null
    city: string | null
    country: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserProfileCountAggregateOutputType = {
    id: number
    userId: number
    firstName: number
    lastName: number
    profileImageUrl: number
    locationLat: number
    locationLng: number
    address: number
    city: number
    country: number
    preferences: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserProfileAvgAggregateInputType = {
    locationLat?: true
    locationLng?: true
  }

  export type UserProfileSumAggregateInputType = {
    locationLat?: true
    locationLng?: true
  }

  export type UserProfileMinAggregateInputType = {
    id?: true
    userId?: true
    firstName?: true
    lastName?: true
    profileImageUrl?: true
    locationLat?: true
    locationLng?: true
    address?: true
    city?: true
    country?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserProfileMaxAggregateInputType = {
    id?: true
    userId?: true
    firstName?: true
    lastName?: true
    profileImageUrl?: true
    locationLat?: true
    locationLng?: true
    address?: true
    city?: true
    country?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserProfileCountAggregateInputType = {
    id?: true
    userId?: true
    firstName?: true
    lastName?: true
    profileImageUrl?: true
    locationLat?: true
    locationLng?: true
    address?: true
    city?: true
    country?: true
    preferences?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProfile to aggregate.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserProfiles
    **/
    _count?: true | UserProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserProfileMaxAggregateInputType
  }

  export type GetUserProfileAggregateType<T extends UserProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateUserProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserProfile[P]>
      : GetScalarType<T[P], AggregateUserProfile[P]>
  }




  export type UserProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserProfileWhereInput
    orderBy?: UserProfileOrderByWithAggregationInput | UserProfileOrderByWithAggregationInput[]
    by: UserProfileScalarFieldEnum[] | UserProfileScalarFieldEnum
    having?: UserProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserProfileCountAggregateInputType | true
    _avg?: UserProfileAvgAggregateInputType
    _sum?: UserProfileSumAggregateInputType
    _min?: UserProfileMinAggregateInputType
    _max?: UserProfileMaxAggregateInputType
  }

  export type UserProfileGroupByOutputType = {
    id: string
    userId: string
    firstName: string
    lastName: string
    profileImageUrl: string | null
    locationLat: Decimal | null
    locationLng: Decimal | null
    address: string | null
    city: string | null
    country: string | null
    preferences: JsonValue
    createdAt: Date
    updatedAt: Date
    _count: UserProfileCountAggregateOutputType | null
    _avg: UserProfileAvgAggregateOutputType | null
    _sum: UserProfileSumAggregateOutputType | null
    _min: UserProfileMinAggregateOutputType | null
    _max: UserProfileMaxAggregateOutputType | null
  }

  type GetUserProfileGroupByPayload<T extends UserProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserProfileGroupByOutputType[P]>
            : GetScalarType<T[P], UserProfileGroupByOutputType[P]>
        }
      >
    >


  export type UserProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    firstName?: boolean
    lastName?: boolean
    profileImageUrl?: boolean
    locationLat?: boolean
    locationLng?: boolean
    address?: boolean
    city?: boolean
    country?: boolean
    preferences?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userProfile"]>

  export type UserProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    firstName?: boolean
    lastName?: boolean
    profileImageUrl?: boolean
    locationLat?: boolean
    locationLng?: boolean
    address?: boolean
    city?: boolean
    country?: boolean
    preferences?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userProfile"]>

  export type UserProfileSelectScalar = {
    id?: boolean
    userId?: boolean
    firstName?: boolean
    lastName?: boolean
    profileImageUrl?: boolean
    locationLat?: boolean
    locationLng?: boolean
    address?: boolean
    city?: boolean
    country?: boolean
    preferences?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserProfile"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      firstName: string
      lastName: string
      profileImageUrl: string | null
      locationLat: Prisma.Decimal | null
      locationLng: Prisma.Decimal | null
      address: string | null
      city: string | null
      country: string | null
      preferences: Prisma.JsonValue
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userProfile"]>
    composites: {}
  }

  type UserProfileGetPayload<S extends boolean | null | undefined | UserProfileDefaultArgs> = $Result.GetResult<Prisma.$UserProfilePayload, S>

  type UserProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserProfileFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserProfileCountAggregateInputType | true
    }

  export interface UserProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserProfile'], meta: { name: 'UserProfile' } }
    /**
     * Find zero or one UserProfile that matches the filter.
     * @param {UserProfileFindUniqueArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserProfileFindUniqueArgs>(args: SelectSubset<T, UserProfileFindUniqueArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one UserProfile that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserProfileFindUniqueOrThrowArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, UserProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first UserProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindFirstArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserProfileFindFirstArgs>(args?: SelectSubset<T, UserProfileFindFirstArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first UserProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindFirstOrThrowArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, UserProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more UserProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserProfiles
     * const userProfiles = await prisma.userProfile.findMany()
     * 
     * // Get first 10 UserProfiles
     * const userProfiles = await prisma.userProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userProfileWithIdOnly = await prisma.userProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserProfileFindManyArgs>(args?: SelectSubset<T, UserProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a UserProfile.
     * @param {UserProfileCreateArgs} args - Arguments to create a UserProfile.
     * @example
     * // Create one UserProfile
     * const UserProfile = await prisma.userProfile.create({
     *   data: {
     *     // ... data to create a UserProfile
     *   }
     * })
     * 
     */
    create<T extends UserProfileCreateArgs>(args: SelectSubset<T, UserProfileCreateArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many UserProfiles.
     * @param {UserProfileCreateManyArgs} args - Arguments to create many UserProfiles.
     * @example
     * // Create many UserProfiles
     * const userProfile = await prisma.userProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserProfileCreateManyArgs>(args?: SelectSubset<T, UserProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserProfiles and returns the data saved in the database.
     * @param {UserProfileCreateManyAndReturnArgs} args - Arguments to create many UserProfiles.
     * @example
     * // Create many UserProfiles
     * const userProfile = await prisma.userProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserProfiles and only return the `id`
     * const userProfileWithIdOnly = await prisma.userProfile.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, UserProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a UserProfile.
     * @param {UserProfileDeleteArgs} args - Arguments to delete one UserProfile.
     * @example
     * // Delete one UserProfile
     * const UserProfile = await prisma.userProfile.delete({
     *   where: {
     *     // ... filter to delete one UserProfile
     *   }
     * })
     * 
     */
    delete<T extends UserProfileDeleteArgs>(args: SelectSubset<T, UserProfileDeleteArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one UserProfile.
     * @param {UserProfileUpdateArgs} args - Arguments to update one UserProfile.
     * @example
     * // Update one UserProfile
     * const userProfile = await prisma.userProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserProfileUpdateArgs>(args: SelectSubset<T, UserProfileUpdateArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more UserProfiles.
     * @param {UserProfileDeleteManyArgs} args - Arguments to filter UserProfiles to delete.
     * @example
     * // Delete a few UserProfiles
     * const { count } = await prisma.userProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserProfileDeleteManyArgs>(args?: SelectSubset<T, UserProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserProfiles
     * const userProfile = await prisma.userProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserProfileUpdateManyArgs>(args: SelectSubset<T, UserProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserProfile.
     * @param {UserProfileUpsertArgs} args - Arguments to update or create a UserProfile.
     * @example
     * // Update or create a UserProfile
     * const userProfile = await prisma.userProfile.upsert({
     *   create: {
     *     // ... data to create a UserProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserProfile we want to update
     *   }
     * })
     */
    upsert<T extends UserProfileUpsertArgs>(args: SelectSubset<T, UserProfileUpsertArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of UserProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileCountArgs} args - Arguments to filter UserProfiles to count.
     * @example
     * // Count the number of UserProfiles
     * const count = await prisma.userProfile.count({
     *   where: {
     *     // ... the filter for the UserProfiles we want to count
     *   }
     * })
    **/
    count<T extends UserProfileCountArgs>(
      args?: Subset<T, UserProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserProfileAggregateArgs>(args: Subset<T, UserProfileAggregateArgs>): Prisma.PrismaPromise<GetUserProfileAggregateType<T>>

    /**
     * Group by UserProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserProfileGroupByArgs['orderBy'] }
        : { orderBy?: UserProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserProfile model
   */
  readonly fields: UserProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserProfile model
   */ 
  interface UserProfileFieldRefs {
    readonly id: FieldRef<"UserProfile", 'String'>
    readonly userId: FieldRef<"UserProfile", 'String'>
    readonly firstName: FieldRef<"UserProfile", 'String'>
    readonly lastName: FieldRef<"UserProfile", 'String'>
    readonly profileImageUrl: FieldRef<"UserProfile", 'String'>
    readonly locationLat: FieldRef<"UserProfile", 'Decimal'>
    readonly locationLng: FieldRef<"UserProfile", 'Decimal'>
    readonly address: FieldRef<"UserProfile", 'String'>
    readonly city: FieldRef<"UserProfile", 'String'>
    readonly country: FieldRef<"UserProfile", 'String'>
    readonly preferences: FieldRef<"UserProfile", 'Json'>
    readonly createdAt: FieldRef<"UserProfile", 'DateTime'>
    readonly updatedAt: FieldRef<"UserProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserProfile findUnique
   */
  export type UserProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile findUniqueOrThrow
   */
  export type UserProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile findFirst
   */
  export type UserProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProfiles.
     */
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
  }

  /**
   * UserProfile findFirstOrThrow
   */
  export type UserProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProfiles.
     */
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
  }

  /**
   * UserProfile findMany
   */
  export type UserProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfiles to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
  }

  /**
   * UserProfile create
   */
  export type UserProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a UserProfile.
     */
    data: XOR<UserProfileCreateInput, UserProfileUncheckedCreateInput>
  }

  /**
   * UserProfile createMany
   */
  export type UserProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserProfiles.
     */
    data: UserProfileCreateManyInput | UserProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserProfile createManyAndReturn
   */
  export type UserProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many UserProfiles.
     */
    data: UserProfileCreateManyInput | UserProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserProfile update
   */
  export type UserProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a UserProfile.
     */
    data: XOR<UserProfileUpdateInput, UserProfileUncheckedUpdateInput>
    /**
     * Choose, which UserProfile to update.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile updateMany
   */
  export type UserProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserProfiles.
     */
    data: XOR<UserProfileUpdateManyMutationInput, UserProfileUncheckedUpdateManyInput>
    /**
     * Filter which UserProfiles to update
     */
    where?: UserProfileWhereInput
  }

  /**
   * UserProfile upsert
   */
  export type UserProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the UserProfile to update in case it exists.
     */
    where: UserProfileWhereUniqueInput
    /**
     * In case the UserProfile found by the `where` argument doesn't exist, create a new UserProfile with this data.
     */
    create: XOR<UserProfileCreateInput, UserProfileUncheckedCreateInput>
    /**
     * In case the UserProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserProfileUpdateInput, UserProfileUncheckedUpdateInput>
  }

  /**
   * UserProfile delete
   */
  export type UserProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter which UserProfile to delete.
     */
    where: UserProfileWhereUniqueInput
  }

  /**
   * UserProfile deleteMany
   */
  export type UserProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProfiles to delete
     */
    where?: UserProfileWhereInput
  }

  /**
   * UserProfile without action
   */
  export type UserProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
  }


  /**
   * Model AuthToken
   */

  export type AggregateAuthToken = {
    _count: AuthTokenCountAggregateOutputType | null
    _min: AuthTokenMinAggregateOutputType | null
    _max: AuthTokenMaxAggregateOutputType | null
  }

  export type AuthTokenMinAggregateOutputType = {
    id: string | null
    userId: string | null
    tokenType: $Enums.TokenType | null
    tokenHash: string | null
    deviceFingerprint: string | null
    ipAddress: string | null
    userAgent: string | null
    expiresAt: Date | null
    lastUsedAt: Date | null
    createdAt: Date | null
    revokedAt: Date | null
  }

  export type AuthTokenMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    tokenType: $Enums.TokenType | null
    tokenHash: string | null
    deviceFingerprint: string | null
    ipAddress: string | null
    userAgent: string | null
    expiresAt: Date | null
    lastUsedAt: Date | null
    createdAt: Date | null
    revokedAt: Date | null
  }

  export type AuthTokenCountAggregateOutputType = {
    id: number
    userId: number
    tokenType: number
    tokenHash: number
    deviceFingerprint: number
    ipAddress: number
    userAgent: number
    expiresAt: number
    lastUsedAt: number
    createdAt: number
    revokedAt: number
    _all: number
  }


  export type AuthTokenMinAggregateInputType = {
    id?: true
    userId?: true
    tokenType?: true
    tokenHash?: true
    deviceFingerprint?: true
    ipAddress?: true
    userAgent?: true
    expiresAt?: true
    lastUsedAt?: true
    createdAt?: true
    revokedAt?: true
  }

  export type AuthTokenMaxAggregateInputType = {
    id?: true
    userId?: true
    tokenType?: true
    tokenHash?: true
    deviceFingerprint?: true
    ipAddress?: true
    userAgent?: true
    expiresAt?: true
    lastUsedAt?: true
    createdAt?: true
    revokedAt?: true
  }

  export type AuthTokenCountAggregateInputType = {
    id?: true
    userId?: true
    tokenType?: true
    tokenHash?: true
    deviceFingerprint?: true
    ipAddress?: true
    userAgent?: true
    expiresAt?: true
    lastUsedAt?: true
    createdAt?: true
    revokedAt?: true
    _all?: true
  }

  export type AuthTokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuthToken to aggregate.
     */
    where?: AuthTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthTokens to fetch.
     */
    orderBy?: AuthTokenOrderByWithRelationInput | AuthTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AuthTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AuthTokens
    **/
    _count?: true | AuthTokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AuthTokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AuthTokenMaxAggregateInputType
  }

  export type GetAuthTokenAggregateType<T extends AuthTokenAggregateArgs> = {
        [P in keyof T & keyof AggregateAuthToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAuthToken[P]>
      : GetScalarType<T[P], AggregateAuthToken[P]>
  }




  export type AuthTokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AuthTokenWhereInput
    orderBy?: AuthTokenOrderByWithAggregationInput | AuthTokenOrderByWithAggregationInput[]
    by: AuthTokenScalarFieldEnum[] | AuthTokenScalarFieldEnum
    having?: AuthTokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AuthTokenCountAggregateInputType | true
    _min?: AuthTokenMinAggregateInputType
    _max?: AuthTokenMaxAggregateInputType
  }

  export type AuthTokenGroupByOutputType = {
    id: string
    userId: string
    tokenType: $Enums.TokenType
    tokenHash: string
    deviceFingerprint: string | null
    ipAddress: string | null
    userAgent: string | null
    expiresAt: Date
    lastUsedAt: Date | null
    createdAt: Date
    revokedAt: Date | null
    _count: AuthTokenCountAggregateOutputType | null
    _min: AuthTokenMinAggregateOutputType | null
    _max: AuthTokenMaxAggregateOutputType | null
  }

  type GetAuthTokenGroupByPayload<T extends AuthTokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AuthTokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AuthTokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AuthTokenGroupByOutputType[P]>
            : GetScalarType<T[P], AuthTokenGroupByOutputType[P]>
        }
      >
    >


  export type AuthTokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    tokenType?: boolean
    tokenHash?: boolean
    deviceFingerprint?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    expiresAt?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
    revokedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["authToken"]>

  export type AuthTokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    tokenType?: boolean
    tokenHash?: boolean
    deviceFingerprint?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    expiresAt?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
    revokedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["authToken"]>

  export type AuthTokenSelectScalar = {
    id?: boolean
    userId?: boolean
    tokenType?: boolean
    tokenHash?: boolean
    deviceFingerprint?: boolean
    ipAddress?: boolean
    userAgent?: boolean
    expiresAt?: boolean
    lastUsedAt?: boolean
    createdAt?: boolean
    revokedAt?: boolean
  }

  export type AuthTokenInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type AuthTokenIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $AuthTokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AuthToken"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      tokenType: $Enums.TokenType
      tokenHash: string
      deviceFingerprint: string | null
      ipAddress: string | null
      userAgent: string | null
      expiresAt: Date
      lastUsedAt: Date | null
      createdAt: Date
      revokedAt: Date | null
    }, ExtArgs["result"]["authToken"]>
    composites: {}
  }

  type AuthTokenGetPayload<S extends boolean | null | undefined | AuthTokenDefaultArgs> = $Result.GetResult<Prisma.$AuthTokenPayload, S>

  type AuthTokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AuthTokenFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AuthTokenCountAggregateInputType | true
    }

  export interface AuthTokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AuthToken'], meta: { name: 'AuthToken' } }
    /**
     * Find zero or one AuthToken that matches the filter.
     * @param {AuthTokenFindUniqueArgs} args - Arguments to find a AuthToken
     * @example
     * // Get one AuthToken
     * const authToken = await prisma.authToken.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AuthTokenFindUniqueArgs>(args: SelectSubset<T, AuthTokenFindUniqueArgs<ExtArgs>>): Prisma__AuthTokenClient<$Result.GetResult<Prisma.$AuthTokenPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AuthToken that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AuthTokenFindUniqueOrThrowArgs} args - Arguments to find a AuthToken
     * @example
     * // Get one AuthToken
     * const authToken = await prisma.authToken.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AuthTokenFindUniqueOrThrowArgs>(args: SelectSubset<T, AuthTokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AuthTokenClient<$Result.GetResult<Prisma.$AuthTokenPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AuthToken that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthTokenFindFirstArgs} args - Arguments to find a AuthToken
     * @example
     * // Get one AuthToken
     * const authToken = await prisma.authToken.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AuthTokenFindFirstArgs>(args?: SelectSubset<T, AuthTokenFindFirstArgs<ExtArgs>>): Prisma__AuthTokenClient<$Result.GetResult<Prisma.$AuthTokenPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AuthToken that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthTokenFindFirstOrThrowArgs} args - Arguments to find a AuthToken
     * @example
     * // Get one AuthToken
     * const authToken = await prisma.authToken.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AuthTokenFindFirstOrThrowArgs>(args?: SelectSubset<T, AuthTokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__AuthTokenClient<$Result.GetResult<Prisma.$AuthTokenPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AuthTokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthTokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AuthTokens
     * const authTokens = await prisma.authToken.findMany()
     * 
     * // Get first 10 AuthTokens
     * const authTokens = await prisma.authToken.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const authTokenWithIdOnly = await prisma.authToken.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AuthTokenFindManyArgs>(args?: SelectSubset<T, AuthTokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthTokenPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AuthToken.
     * @param {AuthTokenCreateArgs} args - Arguments to create a AuthToken.
     * @example
     * // Create one AuthToken
     * const AuthToken = await prisma.authToken.create({
     *   data: {
     *     // ... data to create a AuthToken
     *   }
     * })
     * 
     */
    create<T extends AuthTokenCreateArgs>(args: SelectSubset<T, AuthTokenCreateArgs<ExtArgs>>): Prisma__AuthTokenClient<$Result.GetResult<Prisma.$AuthTokenPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AuthTokens.
     * @param {AuthTokenCreateManyArgs} args - Arguments to create many AuthTokens.
     * @example
     * // Create many AuthTokens
     * const authToken = await prisma.authToken.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AuthTokenCreateManyArgs>(args?: SelectSubset<T, AuthTokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AuthTokens and returns the data saved in the database.
     * @param {AuthTokenCreateManyAndReturnArgs} args - Arguments to create many AuthTokens.
     * @example
     * // Create many AuthTokens
     * const authToken = await prisma.authToken.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AuthTokens and only return the `id`
     * const authTokenWithIdOnly = await prisma.authToken.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AuthTokenCreateManyAndReturnArgs>(args?: SelectSubset<T, AuthTokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AuthTokenPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AuthToken.
     * @param {AuthTokenDeleteArgs} args - Arguments to delete one AuthToken.
     * @example
     * // Delete one AuthToken
     * const AuthToken = await prisma.authToken.delete({
     *   where: {
     *     // ... filter to delete one AuthToken
     *   }
     * })
     * 
     */
    delete<T extends AuthTokenDeleteArgs>(args: SelectSubset<T, AuthTokenDeleteArgs<ExtArgs>>): Prisma__AuthTokenClient<$Result.GetResult<Prisma.$AuthTokenPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AuthToken.
     * @param {AuthTokenUpdateArgs} args - Arguments to update one AuthToken.
     * @example
     * // Update one AuthToken
     * const authToken = await prisma.authToken.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AuthTokenUpdateArgs>(args: SelectSubset<T, AuthTokenUpdateArgs<ExtArgs>>): Prisma__AuthTokenClient<$Result.GetResult<Prisma.$AuthTokenPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AuthTokens.
     * @param {AuthTokenDeleteManyArgs} args - Arguments to filter AuthTokens to delete.
     * @example
     * // Delete a few AuthTokens
     * const { count } = await prisma.authToken.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AuthTokenDeleteManyArgs>(args?: SelectSubset<T, AuthTokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AuthTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthTokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AuthTokens
     * const authToken = await prisma.authToken.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AuthTokenUpdateManyArgs>(args: SelectSubset<T, AuthTokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AuthToken.
     * @param {AuthTokenUpsertArgs} args - Arguments to update or create a AuthToken.
     * @example
     * // Update or create a AuthToken
     * const authToken = await prisma.authToken.upsert({
     *   create: {
     *     // ... data to create a AuthToken
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AuthToken we want to update
     *   }
     * })
     */
    upsert<T extends AuthTokenUpsertArgs>(args: SelectSubset<T, AuthTokenUpsertArgs<ExtArgs>>): Prisma__AuthTokenClient<$Result.GetResult<Prisma.$AuthTokenPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AuthTokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthTokenCountArgs} args - Arguments to filter AuthTokens to count.
     * @example
     * // Count the number of AuthTokens
     * const count = await prisma.authToken.count({
     *   where: {
     *     // ... the filter for the AuthTokens we want to count
     *   }
     * })
    **/
    count<T extends AuthTokenCountArgs>(
      args?: Subset<T, AuthTokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AuthTokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AuthToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthTokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AuthTokenAggregateArgs>(args: Subset<T, AuthTokenAggregateArgs>): Prisma.PrismaPromise<GetAuthTokenAggregateType<T>>

    /**
     * Group by AuthToken.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AuthTokenGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AuthTokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AuthTokenGroupByArgs['orderBy'] }
        : { orderBy?: AuthTokenGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AuthTokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAuthTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AuthToken model
   */
  readonly fields: AuthTokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AuthToken.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AuthTokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AuthToken model
   */ 
  interface AuthTokenFieldRefs {
    readonly id: FieldRef<"AuthToken", 'String'>
    readonly userId: FieldRef<"AuthToken", 'String'>
    readonly tokenType: FieldRef<"AuthToken", 'TokenType'>
    readonly tokenHash: FieldRef<"AuthToken", 'String'>
    readonly deviceFingerprint: FieldRef<"AuthToken", 'String'>
    readonly ipAddress: FieldRef<"AuthToken", 'String'>
    readonly userAgent: FieldRef<"AuthToken", 'String'>
    readonly expiresAt: FieldRef<"AuthToken", 'DateTime'>
    readonly lastUsedAt: FieldRef<"AuthToken", 'DateTime'>
    readonly createdAt: FieldRef<"AuthToken", 'DateTime'>
    readonly revokedAt: FieldRef<"AuthToken", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AuthToken findUnique
   */
  export type AuthTokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthToken
     */
    select?: AuthTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthTokenInclude<ExtArgs> | null
    /**
     * Filter, which AuthToken to fetch.
     */
    where: AuthTokenWhereUniqueInput
  }

  /**
   * AuthToken findUniqueOrThrow
   */
  export type AuthTokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthToken
     */
    select?: AuthTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthTokenInclude<ExtArgs> | null
    /**
     * Filter, which AuthToken to fetch.
     */
    where: AuthTokenWhereUniqueInput
  }

  /**
   * AuthToken findFirst
   */
  export type AuthTokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthToken
     */
    select?: AuthTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthTokenInclude<ExtArgs> | null
    /**
     * Filter, which AuthToken to fetch.
     */
    where?: AuthTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthTokens to fetch.
     */
    orderBy?: AuthTokenOrderByWithRelationInput | AuthTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuthTokens.
     */
    cursor?: AuthTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuthTokens.
     */
    distinct?: AuthTokenScalarFieldEnum | AuthTokenScalarFieldEnum[]
  }

  /**
   * AuthToken findFirstOrThrow
   */
  export type AuthTokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthToken
     */
    select?: AuthTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthTokenInclude<ExtArgs> | null
    /**
     * Filter, which AuthToken to fetch.
     */
    where?: AuthTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthTokens to fetch.
     */
    orderBy?: AuthTokenOrderByWithRelationInput | AuthTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AuthTokens.
     */
    cursor?: AuthTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthTokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AuthTokens.
     */
    distinct?: AuthTokenScalarFieldEnum | AuthTokenScalarFieldEnum[]
  }

  /**
   * AuthToken findMany
   */
  export type AuthTokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthToken
     */
    select?: AuthTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthTokenInclude<ExtArgs> | null
    /**
     * Filter, which AuthTokens to fetch.
     */
    where?: AuthTokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AuthTokens to fetch.
     */
    orderBy?: AuthTokenOrderByWithRelationInput | AuthTokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AuthTokens.
     */
    cursor?: AuthTokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AuthTokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AuthTokens.
     */
    skip?: number
    distinct?: AuthTokenScalarFieldEnum | AuthTokenScalarFieldEnum[]
  }

  /**
   * AuthToken create
   */
  export type AuthTokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthToken
     */
    select?: AuthTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthTokenInclude<ExtArgs> | null
    /**
     * The data needed to create a AuthToken.
     */
    data: XOR<AuthTokenCreateInput, AuthTokenUncheckedCreateInput>
  }

  /**
   * AuthToken createMany
   */
  export type AuthTokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AuthTokens.
     */
    data: AuthTokenCreateManyInput | AuthTokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AuthToken createManyAndReturn
   */
  export type AuthTokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthToken
     */
    select?: AuthTokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AuthTokens.
     */
    data: AuthTokenCreateManyInput | AuthTokenCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthTokenIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AuthToken update
   */
  export type AuthTokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthToken
     */
    select?: AuthTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthTokenInclude<ExtArgs> | null
    /**
     * The data needed to update a AuthToken.
     */
    data: XOR<AuthTokenUpdateInput, AuthTokenUncheckedUpdateInput>
    /**
     * Choose, which AuthToken to update.
     */
    where: AuthTokenWhereUniqueInput
  }

  /**
   * AuthToken updateMany
   */
  export type AuthTokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AuthTokens.
     */
    data: XOR<AuthTokenUpdateManyMutationInput, AuthTokenUncheckedUpdateManyInput>
    /**
     * Filter which AuthTokens to update
     */
    where?: AuthTokenWhereInput
  }

  /**
   * AuthToken upsert
   */
  export type AuthTokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthToken
     */
    select?: AuthTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthTokenInclude<ExtArgs> | null
    /**
     * The filter to search for the AuthToken to update in case it exists.
     */
    where: AuthTokenWhereUniqueInput
    /**
     * In case the AuthToken found by the `where` argument doesn't exist, create a new AuthToken with this data.
     */
    create: XOR<AuthTokenCreateInput, AuthTokenUncheckedCreateInput>
    /**
     * In case the AuthToken was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AuthTokenUpdateInput, AuthTokenUncheckedUpdateInput>
  }

  /**
   * AuthToken delete
   */
  export type AuthTokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthToken
     */
    select?: AuthTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthTokenInclude<ExtArgs> | null
    /**
     * Filter which AuthToken to delete.
     */
    where: AuthTokenWhereUniqueInput
  }

  /**
   * AuthToken deleteMany
   */
  export type AuthTokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AuthTokens to delete
     */
    where?: AuthTokenWhereInput
  }

  /**
   * AuthToken without action
   */
  export type AuthTokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AuthToken
     */
    select?: AuthTokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AuthTokenInclude<ExtArgs> | null
  }


  /**
   * Model RequestCategory
   */

  export type AggregateRequestCategory = {
    _count: RequestCategoryCountAggregateOutputType | null
    _avg: RequestCategoryAvgAggregateOutputType | null
    _sum: RequestCategorySumAggregateOutputType | null
    _min: RequestCategoryMinAggregateOutputType | null
    _max: RequestCategoryMaxAggregateOutputType | null
  }

  export type RequestCategoryAvgAggregateOutputType = {
    sortOrder: number | null
  }

  export type RequestCategorySumAggregateOutputType = {
    sortOrder: number | null
  }

  export type RequestCategoryMinAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    description: string | null
    parentId: string | null
    iconUrl: string | null
    isActive: boolean | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RequestCategoryMaxAggregateOutputType = {
    id: string | null
    name: string | null
    slug: string | null
    description: string | null
    parentId: string | null
    iconUrl: string | null
    isActive: boolean | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RequestCategoryCountAggregateOutputType = {
    id: number
    name: number
    slug: number
    description: number
    parentId: number
    iconUrl: number
    isActive: number
    sortOrder: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RequestCategoryAvgAggregateInputType = {
    sortOrder?: true
  }

  export type RequestCategorySumAggregateInputType = {
    sortOrder?: true
  }

  export type RequestCategoryMinAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    parentId?: true
    iconUrl?: true
    isActive?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RequestCategoryMaxAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    parentId?: true
    iconUrl?: true
    isActive?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RequestCategoryCountAggregateInputType = {
    id?: true
    name?: true
    slug?: true
    description?: true
    parentId?: true
    iconUrl?: true
    isActive?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RequestCategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RequestCategory to aggregate.
     */
    where?: RequestCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestCategories to fetch.
     */
    orderBy?: RequestCategoryOrderByWithRelationInput | RequestCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RequestCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RequestCategories
    **/
    _count?: true | RequestCategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RequestCategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RequestCategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RequestCategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RequestCategoryMaxAggregateInputType
  }

  export type GetRequestCategoryAggregateType<T extends RequestCategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateRequestCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRequestCategory[P]>
      : GetScalarType<T[P], AggregateRequestCategory[P]>
  }




  export type RequestCategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequestCategoryWhereInput
    orderBy?: RequestCategoryOrderByWithAggregationInput | RequestCategoryOrderByWithAggregationInput[]
    by: RequestCategoryScalarFieldEnum[] | RequestCategoryScalarFieldEnum
    having?: RequestCategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RequestCategoryCountAggregateInputType | true
    _avg?: RequestCategoryAvgAggregateInputType
    _sum?: RequestCategorySumAggregateInputType
    _min?: RequestCategoryMinAggregateInputType
    _max?: RequestCategoryMaxAggregateInputType
  }

  export type RequestCategoryGroupByOutputType = {
    id: string
    name: string
    slug: string
    description: string | null
    parentId: string | null
    iconUrl: string | null
    isActive: boolean
    sortOrder: number
    createdAt: Date
    updatedAt: Date
    _count: RequestCategoryCountAggregateOutputType | null
    _avg: RequestCategoryAvgAggregateOutputType | null
    _sum: RequestCategorySumAggregateOutputType | null
    _min: RequestCategoryMinAggregateOutputType | null
    _max: RequestCategoryMaxAggregateOutputType | null
  }

  type GetRequestCategoryGroupByPayload<T extends RequestCategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RequestCategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RequestCategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RequestCategoryGroupByOutputType[P]>
            : GetScalarType<T[P], RequestCategoryGroupByOutputType[P]>
        }
      >
    >


  export type RequestCategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    parentId?: boolean
    iconUrl?: boolean
    isActive?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | RequestCategory$parentArgs<ExtArgs>
    children?: boolean | RequestCategory$childrenArgs<ExtArgs>
    requests?: boolean | RequestCategory$requestsArgs<ExtArgs>
    drafts?: boolean | RequestCategory$draftsArgs<ExtArgs>
    _count?: boolean | RequestCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["requestCategory"]>

  export type RequestCategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    parentId?: boolean
    iconUrl?: boolean
    isActive?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | RequestCategory$parentArgs<ExtArgs>
  }, ExtArgs["result"]["requestCategory"]>

  export type RequestCategorySelectScalar = {
    id?: boolean
    name?: boolean
    slug?: boolean
    description?: boolean
    parentId?: boolean
    iconUrl?: boolean
    isActive?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RequestCategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | RequestCategory$parentArgs<ExtArgs>
    children?: boolean | RequestCategory$childrenArgs<ExtArgs>
    requests?: boolean | RequestCategory$requestsArgs<ExtArgs>
    drafts?: boolean | RequestCategory$draftsArgs<ExtArgs>
    _count?: boolean | RequestCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RequestCategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | RequestCategory$parentArgs<ExtArgs>
  }

  export type $RequestCategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RequestCategory"
    objects: {
      parent: Prisma.$RequestCategoryPayload<ExtArgs> | null
      children: Prisma.$RequestCategoryPayload<ExtArgs>[]
      requests: Prisma.$RequestPayload<ExtArgs>[]
      drafts: Prisma.$RequestDraftPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      slug: string
      description: string | null
      parentId: string | null
      iconUrl: string | null
      isActive: boolean
      sortOrder: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["requestCategory"]>
    composites: {}
  }

  type RequestCategoryGetPayload<S extends boolean | null | undefined | RequestCategoryDefaultArgs> = $Result.GetResult<Prisma.$RequestCategoryPayload, S>

  type RequestCategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RequestCategoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RequestCategoryCountAggregateInputType | true
    }

  export interface RequestCategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RequestCategory'], meta: { name: 'RequestCategory' } }
    /**
     * Find zero or one RequestCategory that matches the filter.
     * @param {RequestCategoryFindUniqueArgs} args - Arguments to find a RequestCategory
     * @example
     * // Get one RequestCategory
     * const requestCategory = await prisma.requestCategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RequestCategoryFindUniqueArgs>(args: SelectSubset<T, RequestCategoryFindUniqueArgs<ExtArgs>>): Prisma__RequestCategoryClient<$Result.GetResult<Prisma.$RequestCategoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one RequestCategory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RequestCategoryFindUniqueOrThrowArgs} args - Arguments to find a RequestCategory
     * @example
     * // Get one RequestCategory
     * const requestCategory = await prisma.requestCategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RequestCategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, RequestCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RequestCategoryClient<$Result.GetResult<Prisma.$RequestCategoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first RequestCategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestCategoryFindFirstArgs} args - Arguments to find a RequestCategory
     * @example
     * // Get one RequestCategory
     * const requestCategory = await prisma.requestCategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RequestCategoryFindFirstArgs>(args?: SelectSubset<T, RequestCategoryFindFirstArgs<ExtArgs>>): Prisma__RequestCategoryClient<$Result.GetResult<Prisma.$RequestCategoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first RequestCategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestCategoryFindFirstOrThrowArgs} args - Arguments to find a RequestCategory
     * @example
     * // Get one RequestCategory
     * const requestCategory = await prisma.requestCategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RequestCategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, RequestCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__RequestCategoryClient<$Result.GetResult<Prisma.$RequestCategoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more RequestCategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestCategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RequestCategories
     * const requestCategories = await prisma.requestCategory.findMany()
     * 
     * // Get first 10 RequestCategories
     * const requestCategories = await prisma.requestCategory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const requestCategoryWithIdOnly = await prisma.requestCategory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RequestCategoryFindManyArgs>(args?: SelectSubset<T, RequestCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestCategoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a RequestCategory.
     * @param {RequestCategoryCreateArgs} args - Arguments to create a RequestCategory.
     * @example
     * // Create one RequestCategory
     * const RequestCategory = await prisma.requestCategory.create({
     *   data: {
     *     // ... data to create a RequestCategory
     *   }
     * })
     * 
     */
    create<T extends RequestCategoryCreateArgs>(args: SelectSubset<T, RequestCategoryCreateArgs<ExtArgs>>): Prisma__RequestCategoryClient<$Result.GetResult<Prisma.$RequestCategoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many RequestCategories.
     * @param {RequestCategoryCreateManyArgs} args - Arguments to create many RequestCategories.
     * @example
     * // Create many RequestCategories
     * const requestCategory = await prisma.requestCategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RequestCategoryCreateManyArgs>(args?: SelectSubset<T, RequestCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RequestCategories and returns the data saved in the database.
     * @param {RequestCategoryCreateManyAndReturnArgs} args - Arguments to create many RequestCategories.
     * @example
     * // Create many RequestCategories
     * const requestCategory = await prisma.requestCategory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RequestCategories and only return the `id`
     * const requestCategoryWithIdOnly = await prisma.requestCategory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RequestCategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, RequestCategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestCategoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a RequestCategory.
     * @param {RequestCategoryDeleteArgs} args - Arguments to delete one RequestCategory.
     * @example
     * // Delete one RequestCategory
     * const RequestCategory = await prisma.requestCategory.delete({
     *   where: {
     *     // ... filter to delete one RequestCategory
     *   }
     * })
     * 
     */
    delete<T extends RequestCategoryDeleteArgs>(args: SelectSubset<T, RequestCategoryDeleteArgs<ExtArgs>>): Prisma__RequestCategoryClient<$Result.GetResult<Prisma.$RequestCategoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one RequestCategory.
     * @param {RequestCategoryUpdateArgs} args - Arguments to update one RequestCategory.
     * @example
     * // Update one RequestCategory
     * const requestCategory = await prisma.requestCategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RequestCategoryUpdateArgs>(args: SelectSubset<T, RequestCategoryUpdateArgs<ExtArgs>>): Prisma__RequestCategoryClient<$Result.GetResult<Prisma.$RequestCategoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more RequestCategories.
     * @param {RequestCategoryDeleteManyArgs} args - Arguments to filter RequestCategories to delete.
     * @example
     * // Delete a few RequestCategories
     * const { count } = await prisma.requestCategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RequestCategoryDeleteManyArgs>(args?: SelectSubset<T, RequestCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RequestCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestCategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RequestCategories
     * const requestCategory = await prisma.requestCategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RequestCategoryUpdateManyArgs>(args: SelectSubset<T, RequestCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one RequestCategory.
     * @param {RequestCategoryUpsertArgs} args - Arguments to update or create a RequestCategory.
     * @example
     * // Update or create a RequestCategory
     * const requestCategory = await prisma.requestCategory.upsert({
     *   create: {
     *     // ... data to create a RequestCategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RequestCategory we want to update
     *   }
     * })
     */
    upsert<T extends RequestCategoryUpsertArgs>(args: SelectSubset<T, RequestCategoryUpsertArgs<ExtArgs>>): Prisma__RequestCategoryClient<$Result.GetResult<Prisma.$RequestCategoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of RequestCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestCategoryCountArgs} args - Arguments to filter RequestCategories to count.
     * @example
     * // Count the number of RequestCategories
     * const count = await prisma.requestCategory.count({
     *   where: {
     *     // ... the filter for the RequestCategories we want to count
     *   }
     * })
    **/
    count<T extends RequestCategoryCountArgs>(
      args?: Subset<T, RequestCategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RequestCategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RequestCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestCategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RequestCategoryAggregateArgs>(args: Subset<T, RequestCategoryAggregateArgs>): Prisma.PrismaPromise<GetRequestCategoryAggregateType<T>>

    /**
     * Group by RequestCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestCategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RequestCategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RequestCategoryGroupByArgs['orderBy'] }
        : { orderBy?: RequestCategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RequestCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRequestCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RequestCategory model
   */
  readonly fields: RequestCategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RequestCategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RequestCategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    parent<T extends RequestCategory$parentArgs<ExtArgs> = {}>(args?: Subset<T, RequestCategory$parentArgs<ExtArgs>>): Prisma__RequestCategoryClient<$Result.GetResult<Prisma.$RequestCategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    children<T extends RequestCategory$childrenArgs<ExtArgs> = {}>(args?: Subset<T, RequestCategory$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestCategoryPayload<ExtArgs>, T, "findMany"> | Null>
    requests<T extends RequestCategory$requestsArgs<ExtArgs> = {}>(args?: Subset<T, RequestCategory$requestsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestPayload<ExtArgs>, T, "findMany"> | Null>
    drafts<T extends RequestCategory$draftsArgs<ExtArgs> = {}>(args?: Subset<T, RequestCategory$draftsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestDraftPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RequestCategory model
   */ 
  interface RequestCategoryFieldRefs {
    readonly id: FieldRef<"RequestCategory", 'String'>
    readonly name: FieldRef<"RequestCategory", 'String'>
    readonly slug: FieldRef<"RequestCategory", 'String'>
    readonly description: FieldRef<"RequestCategory", 'String'>
    readonly parentId: FieldRef<"RequestCategory", 'String'>
    readonly iconUrl: FieldRef<"RequestCategory", 'String'>
    readonly isActive: FieldRef<"RequestCategory", 'Boolean'>
    readonly sortOrder: FieldRef<"RequestCategory", 'Int'>
    readonly createdAt: FieldRef<"RequestCategory", 'DateTime'>
    readonly updatedAt: FieldRef<"RequestCategory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RequestCategory findUnique
   */
  export type RequestCategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategory
     */
    select?: RequestCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestCategoryInclude<ExtArgs> | null
    /**
     * Filter, which RequestCategory to fetch.
     */
    where: RequestCategoryWhereUniqueInput
  }

  /**
   * RequestCategory findUniqueOrThrow
   */
  export type RequestCategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategory
     */
    select?: RequestCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestCategoryInclude<ExtArgs> | null
    /**
     * Filter, which RequestCategory to fetch.
     */
    where: RequestCategoryWhereUniqueInput
  }

  /**
   * RequestCategory findFirst
   */
  export type RequestCategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategory
     */
    select?: RequestCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestCategoryInclude<ExtArgs> | null
    /**
     * Filter, which RequestCategory to fetch.
     */
    where?: RequestCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestCategories to fetch.
     */
    orderBy?: RequestCategoryOrderByWithRelationInput | RequestCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RequestCategories.
     */
    cursor?: RequestCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequestCategories.
     */
    distinct?: RequestCategoryScalarFieldEnum | RequestCategoryScalarFieldEnum[]
  }

  /**
   * RequestCategory findFirstOrThrow
   */
  export type RequestCategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategory
     */
    select?: RequestCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestCategoryInclude<ExtArgs> | null
    /**
     * Filter, which RequestCategory to fetch.
     */
    where?: RequestCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestCategories to fetch.
     */
    orderBy?: RequestCategoryOrderByWithRelationInput | RequestCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RequestCategories.
     */
    cursor?: RequestCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequestCategories.
     */
    distinct?: RequestCategoryScalarFieldEnum | RequestCategoryScalarFieldEnum[]
  }

  /**
   * RequestCategory findMany
   */
  export type RequestCategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategory
     */
    select?: RequestCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestCategoryInclude<ExtArgs> | null
    /**
     * Filter, which RequestCategories to fetch.
     */
    where?: RequestCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestCategories to fetch.
     */
    orderBy?: RequestCategoryOrderByWithRelationInput | RequestCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RequestCategories.
     */
    cursor?: RequestCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestCategories.
     */
    skip?: number
    distinct?: RequestCategoryScalarFieldEnum | RequestCategoryScalarFieldEnum[]
  }

  /**
   * RequestCategory create
   */
  export type RequestCategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategory
     */
    select?: RequestCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestCategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a RequestCategory.
     */
    data: XOR<RequestCategoryCreateInput, RequestCategoryUncheckedCreateInput>
  }

  /**
   * RequestCategory createMany
   */
  export type RequestCategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RequestCategories.
     */
    data: RequestCategoryCreateManyInput | RequestCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RequestCategory createManyAndReturn
   */
  export type RequestCategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategory
     */
    select?: RequestCategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many RequestCategories.
     */
    data: RequestCategoryCreateManyInput | RequestCategoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestCategoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RequestCategory update
   */
  export type RequestCategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategory
     */
    select?: RequestCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestCategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a RequestCategory.
     */
    data: XOR<RequestCategoryUpdateInput, RequestCategoryUncheckedUpdateInput>
    /**
     * Choose, which RequestCategory to update.
     */
    where: RequestCategoryWhereUniqueInput
  }

  /**
   * RequestCategory updateMany
   */
  export type RequestCategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RequestCategories.
     */
    data: XOR<RequestCategoryUpdateManyMutationInput, RequestCategoryUncheckedUpdateManyInput>
    /**
     * Filter which RequestCategories to update
     */
    where?: RequestCategoryWhereInput
  }

  /**
   * RequestCategory upsert
   */
  export type RequestCategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategory
     */
    select?: RequestCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestCategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the RequestCategory to update in case it exists.
     */
    where: RequestCategoryWhereUniqueInput
    /**
     * In case the RequestCategory found by the `where` argument doesn't exist, create a new RequestCategory with this data.
     */
    create: XOR<RequestCategoryCreateInput, RequestCategoryUncheckedCreateInput>
    /**
     * In case the RequestCategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RequestCategoryUpdateInput, RequestCategoryUncheckedUpdateInput>
  }

  /**
   * RequestCategory delete
   */
  export type RequestCategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategory
     */
    select?: RequestCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestCategoryInclude<ExtArgs> | null
    /**
     * Filter which RequestCategory to delete.
     */
    where: RequestCategoryWhereUniqueInput
  }

  /**
   * RequestCategory deleteMany
   */
  export type RequestCategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RequestCategories to delete
     */
    where?: RequestCategoryWhereInput
  }

  /**
   * RequestCategory.parent
   */
  export type RequestCategory$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategory
     */
    select?: RequestCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestCategoryInclude<ExtArgs> | null
    where?: RequestCategoryWhereInput
  }

  /**
   * RequestCategory.children
   */
  export type RequestCategory$childrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategory
     */
    select?: RequestCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestCategoryInclude<ExtArgs> | null
    where?: RequestCategoryWhereInput
    orderBy?: RequestCategoryOrderByWithRelationInput | RequestCategoryOrderByWithRelationInput[]
    cursor?: RequestCategoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RequestCategoryScalarFieldEnum | RequestCategoryScalarFieldEnum[]
  }

  /**
   * RequestCategory.requests
   */
  export type RequestCategory$requestsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Request
     */
    select?: RequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestInclude<ExtArgs> | null
    where?: RequestWhereInput
    orderBy?: RequestOrderByWithRelationInput | RequestOrderByWithRelationInput[]
    cursor?: RequestWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RequestScalarFieldEnum | RequestScalarFieldEnum[]
  }

  /**
   * RequestCategory.drafts
   */
  export type RequestCategory$draftsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestDraft
     */
    select?: RequestDraftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestDraftInclude<ExtArgs> | null
    where?: RequestDraftWhereInput
    orderBy?: RequestDraftOrderByWithRelationInput | RequestDraftOrderByWithRelationInput[]
    cursor?: RequestDraftWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RequestDraftScalarFieldEnum | RequestDraftScalarFieldEnum[]
  }

  /**
   * RequestCategory without action
   */
  export type RequestCategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategory
     */
    select?: RequestCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestCategoryInclude<ExtArgs> | null
  }


  /**
   * Model Request
   */

  export type AggregateRequest = {
    _count: RequestCountAggregateOutputType | null
    _avg: RequestAvgAggregateOutputType | null
    _sum: RequestSumAggregateOutputType | null
    _min: RequestMinAggregateOutputType | null
    _max: RequestMaxAggregateOutputType | null
  }

  export type RequestAvgAggregateOutputType = {
    budgetMin: Decimal | null
    budgetMax: Decimal | null
    locationLat: Decimal | null
    locationLng: Decimal | null
    priorityScore: number | null
    bidCount: number | null
    viewCount: number | null
  }

  export type RequestSumAggregateOutputType = {
    budgetMin: Decimal | null
    budgetMax: Decimal | null
    locationLat: Decimal | null
    locationLng: Decimal | null
    priorityScore: number | null
    bidCount: number | null
    viewCount: number | null
  }

  export type RequestMinAggregateOutputType = {
    id: string | null
    buyerId: string | null
    categoryId: string | null
    title: string | null
    description: string | null
    budgetMin: Decimal | null
    budgetMax: Decimal | null
    locationLat: Decimal | null
    locationLng: Decimal | null
    locationAddress: string | null
    locationCity: string | null
    locationCountry: string | null
    status: $Enums.RequestStatus | null
    priorityScore: number | null
    bidCount: number | null
    viewCount: number | null
    expiresAt: Date | null
    publishedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RequestMaxAggregateOutputType = {
    id: string | null
    buyerId: string | null
    categoryId: string | null
    title: string | null
    description: string | null
    budgetMin: Decimal | null
    budgetMax: Decimal | null
    locationLat: Decimal | null
    locationLng: Decimal | null
    locationAddress: string | null
    locationCity: string | null
    locationCountry: string | null
    status: $Enums.RequestStatus | null
    priorityScore: number | null
    bidCount: number | null
    viewCount: number | null
    expiresAt: Date | null
    publishedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RequestCountAggregateOutputType = {
    id: number
    buyerId: number
    categoryId: number
    title: number
    description: number
    budgetMin: number
    budgetMax: number
    locationLat: number
    locationLng: number
    locationAddress: number
    locationCity: number
    locationCountry: number
    status: number
    priorityScore: number
    bidCount: number
    viewCount: number
    expiresAt: number
    publishedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RequestAvgAggregateInputType = {
    budgetMin?: true
    budgetMax?: true
    locationLat?: true
    locationLng?: true
    priorityScore?: true
    bidCount?: true
    viewCount?: true
  }

  export type RequestSumAggregateInputType = {
    budgetMin?: true
    budgetMax?: true
    locationLat?: true
    locationLng?: true
    priorityScore?: true
    bidCount?: true
    viewCount?: true
  }

  export type RequestMinAggregateInputType = {
    id?: true
    buyerId?: true
    categoryId?: true
    title?: true
    description?: true
    budgetMin?: true
    budgetMax?: true
    locationLat?: true
    locationLng?: true
    locationAddress?: true
    locationCity?: true
    locationCountry?: true
    status?: true
    priorityScore?: true
    bidCount?: true
    viewCount?: true
    expiresAt?: true
    publishedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RequestMaxAggregateInputType = {
    id?: true
    buyerId?: true
    categoryId?: true
    title?: true
    description?: true
    budgetMin?: true
    budgetMax?: true
    locationLat?: true
    locationLng?: true
    locationAddress?: true
    locationCity?: true
    locationCountry?: true
    status?: true
    priorityScore?: true
    bidCount?: true
    viewCount?: true
    expiresAt?: true
    publishedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RequestCountAggregateInputType = {
    id?: true
    buyerId?: true
    categoryId?: true
    title?: true
    description?: true
    budgetMin?: true
    budgetMax?: true
    locationLat?: true
    locationLng?: true
    locationAddress?: true
    locationCity?: true
    locationCountry?: true
    status?: true
    priorityScore?: true
    bidCount?: true
    viewCount?: true
    expiresAt?: true
    publishedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RequestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Request to aggregate.
     */
    where?: RequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requests to fetch.
     */
    orderBy?: RequestOrderByWithRelationInput | RequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Requests
    **/
    _count?: true | RequestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RequestAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RequestSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RequestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RequestMaxAggregateInputType
  }

  export type GetRequestAggregateType<T extends RequestAggregateArgs> = {
        [P in keyof T & keyof AggregateRequest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRequest[P]>
      : GetScalarType<T[P], AggregateRequest[P]>
  }




  export type RequestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequestWhereInput
    orderBy?: RequestOrderByWithAggregationInput | RequestOrderByWithAggregationInput[]
    by: RequestScalarFieldEnum[] | RequestScalarFieldEnum
    having?: RequestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RequestCountAggregateInputType | true
    _avg?: RequestAvgAggregateInputType
    _sum?: RequestSumAggregateInputType
    _min?: RequestMinAggregateInputType
    _max?: RequestMaxAggregateInputType
  }

  export type RequestGroupByOutputType = {
    id: string
    buyerId: string
    categoryId: string
    title: string
    description: string
    budgetMin: Decimal | null
    budgetMax: Decimal | null
    locationLat: Decimal | null
    locationLng: Decimal | null
    locationAddress: string | null
    locationCity: string | null
    locationCountry: string | null
    status: $Enums.RequestStatus
    priorityScore: number
    bidCount: number
    viewCount: number
    expiresAt: Date | null
    publishedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: RequestCountAggregateOutputType | null
    _avg: RequestAvgAggregateOutputType | null
    _sum: RequestSumAggregateOutputType | null
    _min: RequestMinAggregateOutputType | null
    _max: RequestMaxAggregateOutputType | null
  }

  type GetRequestGroupByPayload<T extends RequestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RequestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RequestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RequestGroupByOutputType[P]>
            : GetScalarType<T[P], RequestGroupByOutputType[P]>
        }
      >
    >


  export type RequestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    buyerId?: boolean
    categoryId?: boolean
    title?: boolean
    description?: boolean
    budgetMin?: boolean
    budgetMax?: boolean
    locationLat?: boolean
    locationLng?: boolean
    locationAddress?: boolean
    locationCity?: boolean
    locationCountry?: boolean
    status?: boolean
    priorityScore?: boolean
    bidCount?: boolean
    viewCount?: boolean
    expiresAt?: boolean
    publishedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | RequestCategoryDefaultArgs<ExtArgs>
    images?: boolean | Request$imagesArgs<ExtArgs>
    extensions?: boolean | Request$extensionsArgs<ExtArgs>
    searchIndex?: boolean | Request$searchIndexArgs<ExtArgs>
    _count?: boolean | RequestCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["request"]>

  export type RequestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    buyerId?: boolean
    categoryId?: boolean
    title?: boolean
    description?: boolean
    budgetMin?: boolean
    budgetMax?: boolean
    locationLat?: boolean
    locationLng?: boolean
    locationAddress?: boolean
    locationCity?: boolean
    locationCountry?: boolean
    status?: boolean
    priorityScore?: boolean
    bidCount?: boolean
    viewCount?: boolean
    expiresAt?: boolean
    publishedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | RequestCategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["request"]>

  export type RequestSelectScalar = {
    id?: boolean
    buyerId?: boolean
    categoryId?: boolean
    title?: boolean
    description?: boolean
    budgetMin?: boolean
    budgetMax?: boolean
    locationLat?: boolean
    locationLng?: boolean
    locationAddress?: boolean
    locationCity?: boolean
    locationCountry?: boolean
    status?: boolean
    priorityScore?: boolean
    bidCount?: boolean
    viewCount?: boolean
    expiresAt?: boolean
    publishedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RequestInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | RequestCategoryDefaultArgs<ExtArgs>
    images?: boolean | Request$imagesArgs<ExtArgs>
    extensions?: boolean | Request$extensionsArgs<ExtArgs>
    searchIndex?: boolean | Request$searchIndexArgs<ExtArgs>
    _count?: boolean | RequestCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RequestIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | RequestCategoryDefaultArgs<ExtArgs>
  }

  export type $RequestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Request"
    objects: {
      category: Prisma.$RequestCategoryPayload<ExtArgs>
      images: Prisma.$RequestImagePayload<ExtArgs>[]
      extensions: Prisma.$RequestExtensionPayload<ExtArgs>[]
      searchIndex: Prisma.$RequestSearchIndexPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      buyerId: string
      categoryId: string
      title: string
      description: string
      budgetMin: Prisma.Decimal | null
      budgetMax: Prisma.Decimal | null
      locationLat: Prisma.Decimal | null
      locationLng: Prisma.Decimal | null
      locationAddress: string | null
      locationCity: string | null
      locationCountry: string | null
      status: $Enums.RequestStatus
      priorityScore: number
      bidCount: number
      viewCount: number
      expiresAt: Date | null
      publishedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["request"]>
    composites: {}
  }

  type RequestGetPayload<S extends boolean | null | undefined | RequestDefaultArgs> = $Result.GetResult<Prisma.$RequestPayload, S>

  type RequestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RequestFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RequestCountAggregateInputType | true
    }

  export interface RequestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Request'], meta: { name: 'Request' } }
    /**
     * Find zero or one Request that matches the filter.
     * @param {RequestFindUniqueArgs} args - Arguments to find a Request
     * @example
     * // Get one Request
     * const request = await prisma.request.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RequestFindUniqueArgs>(args: SelectSubset<T, RequestFindUniqueArgs<ExtArgs>>): Prisma__RequestClient<$Result.GetResult<Prisma.$RequestPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Request that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RequestFindUniqueOrThrowArgs} args - Arguments to find a Request
     * @example
     * // Get one Request
     * const request = await prisma.request.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RequestFindUniqueOrThrowArgs>(args: SelectSubset<T, RequestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RequestClient<$Result.GetResult<Prisma.$RequestPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Request that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestFindFirstArgs} args - Arguments to find a Request
     * @example
     * // Get one Request
     * const request = await prisma.request.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RequestFindFirstArgs>(args?: SelectSubset<T, RequestFindFirstArgs<ExtArgs>>): Prisma__RequestClient<$Result.GetResult<Prisma.$RequestPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Request that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestFindFirstOrThrowArgs} args - Arguments to find a Request
     * @example
     * // Get one Request
     * const request = await prisma.request.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RequestFindFirstOrThrowArgs>(args?: SelectSubset<T, RequestFindFirstOrThrowArgs<ExtArgs>>): Prisma__RequestClient<$Result.GetResult<Prisma.$RequestPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Requests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Requests
     * const requests = await prisma.request.findMany()
     * 
     * // Get first 10 Requests
     * const requests = await prisma.request.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const requestWithIdOnly = await prisma.request.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RequestFindManyArgs>(args?: SelectSubset<T, RequestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Request.
     * @param {RequestCreateArgs} args - Arguments to create a Request.
     * @example
     * // Create one Request
     * const Request = await prisma.request.create({
     *   data: {
     *     // ... data to create a Request
     *   }
     * })
     * 
     */
    create<T extends RequestCreateArgs>(args: SelectSubset<T, RequestCreateArgs<ExtArgs>>): Prisma__RequestClient<$Result.GetResult<Prisma.$RequestPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Requests.
     * @param {RequestCreateManyArgs} args - Arguments to create many Requests.
     * @example
     * // Create many Requests
     * const request = await prisma.request.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RequestCreateManyArgs>(args?: SelectSubset<T, RequestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Requests and returns the data saved in the database.
     * @param {RequestCreateManyAndReturnArgs} args - Arguments to create many Requests.
     * @example
     * // Create many Requests
     * const request = await prisma.request.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Requests and only return the `id`
     * const requestWithIdOnly = await prisma.request.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RequestCreateManyAndReturnArgs>(args?: SelectSubset<T, RequestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Request.
     * @param {RequestDeleteArgs} args - Arguments to delete one Request.
     * @example
     * // Delete one Request
     * const Request = await prisma.request.delete({
     *   where: {
     *     // ... filter to delete one Request
     *   }
     * })
     * 
     */
    delete<T extends RequestDeleteArgs>(args: SelectSubset<T, RequestDeleteArgs<ExtArgs>>): Prisma__RequestClient<$Result.GetResult<Prisma.$RequestPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Request.
     * @param {RequestUpdateArgs} args - Arguments to update one Request.
     * @example
     * // Update one Request
     * const request = await prisma.request.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RequestUpdateArgs>(args: SelectSubset<T, RequestUpdateArgs<ExtArgs>>): Prisma__RequestClient<$Result.GetResult<Prisma.$RequestPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Requests.
     * @param {RequestDeleteManyArgs} args - Arguments to filter Requests to delete.
     * @example
     * // Delete a few Requests
     * const { count } = await prisma.request.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RequestDeleteManyArgs>(args?: SelectSubset<T, RequestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Requests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Requests
     * const request = await prisma.request.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RequestUpdateManyArgs>(args: SelectSubset<T, RequestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Request.
     * @param {RequestUpsertArgs} args - Arguments to update or create a Request.
     * @example
     * // Update or create a Request
     * const request = await prisma.request.upsert({
     *   create: {
     *     // ... data to create a Request
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Request we want to update
     *   }
     * })
     */
    upsert<T extends RequestUpsertArgs>(args: SelectSubset<T, RequestUpsertArgs<ExtArgs>>): Prisma__RequestClient<$Result.GetResult<Prisma.$RequestPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Requests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestCountArgs} args - Arguments to filter Requests to count.
     * @example
     * // Count the number of Requests
     * const count = await prisma.request.count({
     *   where: {
     *     // ... the filter for the Requests we want to count
     *   }
     * })
    **/
    count<T extends RequestCountArgs>(
      args?: Subset<T, RequestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RequestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Request.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RequestAggregateArgs>(args: Subset<T, RequestAggregateArgs>): Prisma.PrismaPromise<GetRequestAggregateType<T>>

    /**
     * Group by Request.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RequestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RequestGroupByArgs['orderBy'] }
        : { orderBy?: RequestGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RequestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRequestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Request model
   */
  readonly fields: RequestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Request.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RequestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    category<T extends RequestCategoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RequestCategoryDefaultArgs<ExtArgs>>): Prisma__RequestCategoryClient<$Result.GetResult<Prisma.$RequestCategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    images<T extends Request$imagesArgs<ExtArgs> = {}>(args?: Subset<T, Request$imagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestImagePayload<ExtArgs>, T, "findMany"> | Null>
    extensions<T extends Request$extensionsArgs<ExtArgs> = {}>(args?: Subset<T, Request$extensionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestExtensionPayload<ExtArgs>, T, "findMany"> | Null>
    searchIndex<T extends Request$searchIndexArgs<ExtArgs> = {}>(args?: Subset<T, Request$searchIndexArgs<ExtArgs>>): Prisma__RequestSearchIndexClient<$Result.GetResult<Prisma.$RequestSearchIndexPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Request model
   */ 
  interface RequestFieldRefs {
    readonly id: FieldRef<"Request", 'String'>
    readonly buyerId: FieldRef<"Request", 'String'>
    readonly categoryId: FieldRef<"Request", 'String'>
    readonly title: FieldRef<"Request", 'String'>
    readonly description: FieldRef<"Request", 'String'>
    readonly budgetMin: FieldRef<"Request", 'Decimal'>
    readonly budgetMax: FieldRef<"Request", 'Decimal'>
    readonly locationLat: FieldRef<"Request", 'Decimal'>
    readonly locationLng: FieldRef<"Request", 'Decimal'>
    readonly locationAddress: FieldRef<"Request", 'String'>
    readonly locationCity: FieldRef<"Request", 'String'>
    readonly locationCountry: FieldRef<"Request", 'String'>
    readonly status: FieldRef<"Request", 'RequestStatus'>
    readonly priorityScore: FieldRef<"Request", 'Int'>
    readonly bidCount: FieldRef<"Request", 'Int'>
    readonly viewCount: FieldRef<"Request", 'Int'>
    readonly expiresAt: FieldRef<"Request", 'DateTime'>
    readonly publishedAt: FieldRef<"Request", 'DateTime'>
    readonly createdAt: FieldRef<"Request", 'DateTime'>
    readonly updatedAt: FieldRef<"Request", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Request findUnique
   */
  export type RequestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Request
     */
    select?: RequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestInclude<ExtArgs> | null
    /**
     * Filter, which Request to fetch.
     */
    where: RequestWhereUniqueInput
  }

  /**
   * Request findUniqueOrThrow
   */
  export type RequestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Request
     */
    select?: RequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestInclude<ExtArgs> | null
    /**
     * Filter, which Request to fetch.
     */
    where: RequestWhereUniqueInput
  }

  /**
   * Request findFirst
   */
  export type RequestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Request
     */
    select?: RequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestInclude<ExtArgs> | null
    /**
     * Filter, which Request to fetch.
     */
    where?: RequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requests to fetch.
     */
    orderBy?: RequestOrderByWithRelationInput | RequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Requests.
     */
    cursor?: RequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Requests.
     */
    distinct?: RequestScalarFieldEnum | RequestScalarFieldEnum[]
  }

  /**
   * Request findFirstOrThrow
   */
  export type RequestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Request
     */
    select?: RequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestInclude<ExtArgs> | null
    /**
     * Filter, which Request to fetch.
     */
    where?: RequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requests to fetch.
     */
    orderBy?: RequestOrderByWithRelationInput | RequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Requests.
     */
    cursor?: RequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Requests.
     */
    distinct?: RequestScalarFieldEnum | RequestScalarFieldEnum[]
  }

  /**
   * Request findMany
   */
  export type RequestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Request
     */
    select?: RequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestInclude<ExtArgs> | null
    /**
     * Filter, which Requests to fetch.
     */
    where?: RequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Requests to fetch.
     */
    orderBy?: RequestOrderByWithRelationInput | RequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Requests.
     */
    cursor?: RequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Requests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Requests.
     */
    skip?: number
    distinct?: RequestScalarFieldEnum | RequestScalarFieldEnum[]
  }

  /**
   * Request create
   */
  export type RequestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Request
     */
    select?: RequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestInclude<ExtArgs> | null
    /**
     * The data needed to create a Request.
     */
    data: XOR<RequestCreateInput, RequestUncheckedCreateInput>
  }

  /**
   * Request createMany
   */
  export type RequestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Requests.
     */
    data: RequestCreateManyInput | RequestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Request createManyAndReturn
   */
  export type RequestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Request
     */
    select?: RequestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Requests.
     */
    data: RequestCreateManyInput | RequestCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Request update
   */
  export type RequestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Request
     */
    select?: RequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestInclude<ExtArgs> | null
    /**
     * The data needed to update a Request.
     */
    data: XOR<RequestUpdateInput, RequestUncheckedUpdateInput>
    /**
     * Choose, which Request to update.
     */
    where: RequestWhereUniqueInput
  }

  /**
   * Request updateMany
   */
  export type RequestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Requests.
     */
    data: XOR<RequestUpdateManyMutationInput, RequestUncheckedUpdateManyInput>
    /**
     * Filter which Requests to update
     */
    where?: RequestWhereInput
  }

  /**
   * Request upsert
   */
  export type RequestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Request
     */
    select?: RequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestInclude<ExtArgs> | null
    /**
     * The filter to search for the Request to update in case it exists.
     */
    where: RequestWhereUniqueInput
    /**
     * In case the Request found by the `where` argument doesn't exist, create a new Request with this data.
     */
    create: XOR<RequestCreateInput, RequestUncheckedCreateInput>
    /**
     * In case the Request was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RequestUpdateInput, RequestUncheckedUpdateInput>
  }

  /**
   * Request delete
   */
  export type RequestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Request
     */
    select?: RequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestInclude<ExtArgs> | null
    /**
     * Filter which Request to delete.
     */
    where: RequestWhereUniqueInput
  }

  /**
   * Request deleteMany
   */
  export type RequestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Requests to delete
     */
    where?: RequestWhereInput
  }

  /**
   * Request.images
   */
  export type Request$imagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestImage
     */
    select?: RequestImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestImageInclude<ExtArgs> | null
    where?: RequestImageWhereInput
    orderBy?: RequestImageOrderByWithRelationInput | RequestImageOrderByWithRelationInput[]
    cursor?: RequestImageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RequestImageScalarFieldEnum | RequestImageScalarFieldEnum[]
  }

  /**
   * Request.extensions
   */
  export type Request$extensionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestExtension
     */
    select?: RequestExtensionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestExtensionInclude<ExtArgs> | null
    where?: RequestExtensionWhereInput
    orderBy?: RequestExtensionOrderByWithRelationInput | RequestExtensionOrderByWithRelationInput[]
    cursor?: RequestExtensionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RequestExtensionScalarFieldEnum | RequestExtensionScalarFieldEnum[]
  }

  /**
   * Request.searchIndex
   */
  export type Request$searchIndexArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestSearchIndex
     */
    select?: RequestSearchIndexSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestSearchIndexInclude<ExtArgs> | null
    where?: RequestSearchIndexWhereInput
  }

  /**
   * Request without action
   */
  export type RequestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Request
     */
    select?: RequestSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestInclude<ExtArgs> | null
  }


  /**
   * Model RequestImage
   */

  export type AggregateRequestImage = {
    _count: RequestImageCountAggregateOutputType | null
    _avg: RequestImageAvgAggregateOutputType | null
    _sum: RequestImageSumAggregateOutputType | null
    _min: RequestImageMinAggregateOutputType | null
    _max: RequestImageMaxAggregateOutputType | null
  }

  export type RequestImageAvgAggregateOutputType = {
    fileSize: number | null
    width: number | null
    height: number | null
    sortOrder: number | null
  }

  export type RequestImageSumAggregateOutputType = {
    fileSize: bigint | null
    width: number | null
    height: number | null
    sortOrder: number | null
  }

  export type RequestImageMinAggregateOutputType = {
    id: string | null
    requestId: string | null
    imageUrl: string | null
    thumbnailUrl: string | null
    originalFilename: string | null
    fileSize: bigint | null
    mimeType: string | null
    width: number | null
    height: number | null
    sortOrder: number | null
    isPrimary: boolean | null
    createdAt: Date | null
  }

  export type RequestImageMaxAggregateOutputType = {
    id: string | null
    requestId: string | null
    imageUrl: string | null
    thumbnailUrl: string | null
    originalFilename: string | null
    fileSize: bigint | null
    mimeType: string | null
    width: number | null
    height: number | null
    sortOrder: number | null
    isPrimary: boolean | null
    createdAt: Date | null
  }

  export type RequestImageCountAggregateOutputType = {
    id: number
    requestId: number
    imageUrl: number
    thumbnailUrl: number
    originalFilename: number
    fileSize: number
    mimeType: number
    width: number
    height: number
    sortOrder: number
    isPrimary: number
    createdAt: number
    _all: number
  }


  export type RequestImageAvgAggregateInputType = {
    fileSize?: true
    width?: true
    height?: true
    sortOrder?: true
  }

  export type RequestImageSumAggregateInputType = {
    fileSize?: true
    width?: true
    height?: true
    sortOrder?: true
  }

  export type RequestImageMinAggregateInputType = {
    id?: true
    requestId?: true
    imageUrl?: true
    thumbnailUrl?: true
    originalFilename?: true
    fileSize?: true
    mimeType?: true
    width?: true
    height?: true
    sortOrder?: true
    isPrimary?: true
    createdAt?: true
  }

  export type RequestImageMaxAggregateInputType = {
    id?: true
    requestId?: true
    imageUrl?: true
    thumbnailUrl?: true
    originalFilename?: true
    fileSize?: true
    mimeType?: true
    width?: true
    height?: true
    sortOrder?: true
    isPrimary?: true
    createdAt?: true
  }

  export type RequestImageCountAggregateInputType = {
    id?: true
    requestId?: true
    imageUrl?: true
    thumbnailUrl?: true
    originalFilename?: true
    fileSize?: true
    mimeType?: true
    width?: true
    height?: true
    sortOrder?: true
    isPrimary?: true
    createdAt?: true
    _all?: true
  }

  export type RequestImageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RequestImage to aggregate.
     */
    where?: RequestImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestImages to fetch.
     */
    orderBy?: RequestImageOrderByWithRelationInput | RequestImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RequestImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RequestImages
    **/
    _count?: true | RequestImageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RequestImageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RequestImageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RequestImageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RequestImageMaxAggregateInputType
  }

  export type GetRequestImageAggregateType<T extends RequestImageAggregateArgs> = {
        [P in keyof T & keyof AggregateRequestImage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRequestImage[P]>
      : GetScalarType<T[P], AggregateRequestImage[P]>
  }




  export type RequestImageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequestImageWhereInput
    orderBy?: RequestImageOrderByWithAggregationInput | RequestImageOrderByWithAggregationInput[]
    by: RequestImageScalarFieldEnum[] | RequestImageScalarFieldEnum
    having?: RequestImageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RequestImageCountAggregateInputType | true
    _avg?: RequestImageAvgAggregateInputType
    _sum?: RequestImageSumAggregateInputType
    _min?: RequestImageMinAggregateInputType
    _max?: RequestImageMaxAggregateInputType
  }

  export type RequestImageGroupByOutputType = {
    id: string
    requestId: string
    imageUrl: string
    thumbnailUrl: string | null
    originalFilename: string | null
    fileSize: bigint
    mimeType: string
    width: number | null
    height: number | null
    sortOrder: number
    isPrimary: boolean
    createdAt: Date
    _count: RequestImageCountAggregateOutputType | null
    _avg: RequestImageAvgAggregateOutputType | null
    _sum: RequestImageSumAggregateOutputType | null
    _min: RequestImageMinAggregateOutputType | null
    _max: RequestImageMaxAggregateOutputType | null
  }

  type GetRequestImageGroupByPayload<T extends RequestImageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RequestImageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RequestImageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RequestImageGroupByOutputType[P]>
            : GetScalarType<T[P], RequestImageGroupByOutputType[P]>
        }
      >
    >


  export type RequestImageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    requestId?: boolean
    imageUrl?: boolean
    thumbnailUrl?: boolean
    originalFilename?: boolean
    fileSize?: boolean
    mimeType?: boolean
    width?: boolean
    height?: boolean
    sortOrder?: boolean
    isPrimary?: boolean
    createdAt?: boolean
    request?: boolean | RequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["requestImage"]>

  export type RequestImageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    requestId?: boolean
    imageUrl?: boolean
    thumbnailUrl?: boolean
    originalFilename?: boolean
    fileSize?: boolean
    mimeType?: boolean
    width?: boolean
    height?: boolean
    sortOrder?: boolean
    isPrimary?: boolean
    createdAt?: boolean
    request?: boolean | RequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["requestImage"]>

  export type RequestImageSelectScalar = {
    id?: boolean
    requestId?: boolean
    imageUrl?: boolean
    thumbnailUrl?: boolean
    originalFilename?: boolean
    fileSize?: boolean
    mimeType?: boolean
    width?: boolean
    height?: boolean
    sortOrder?: boolean
    isPrimary?: boolean
    createdAt?: boolean
  }

  export type RequestImageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    request?: boolean | RequestDefaultArgs<ExtArgs>
  }
  export type RequestImageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    request?: boolean | RequestDefaultArgs<ExtArgs>
  }

  export type $RequestImagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RequestImage"
    objects: {
      request: Prisma.$RequestPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      requestId: string
      imageUrl: string
      thumbnailUrl: string | null
      originalFilename: string | null
      fileSize: bigint
      mimeType: string
      width: number | null
      height: number | null
      sortOrder: number
      isPrimary: boolean
      createdAt: Date
    }, ExtArgs["result"]["requestImage"]>
    composites: {}
  }

  type RequestImageGetPayload<S extends boolean | null | undefined | RequestImageDefaultArgs> = $Result.GetResult<Prisma.$RequestImagePayload, S>

  type RequestImageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RequestImageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RequestImageCountAggregateInputType | true
    }

  export interface RequestImageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RequestImage'], meta: { name: 'RequestImage' } }
    /**
     * Find zero or one RequestImage that matches the filter.
     * @param {RequestImageFindUniqueArgs} args - Arguments to find a RequestImage
     * @example
     * // Get one RequestImage
     * const requestImage = await prisma.requestImage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RequestImageFindUniqueArgs>(args: SelectSubset<T, RequestImageFindUniqueArgs<ExtArgs>>): Prisma__RequestImageClient<$Result.GetResult<Prisma.$RequestImagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one RequestImage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RequestImageFindUniqueOrThrowArgs} args - Arguments to find a RequestImage
     * @example
     * // Get one RequestImage
     * const requestImage = await prisma.requestImage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RequestImageFindUniqueOrThrowArgs>(args: SelectSubset<T, RequestImageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RequestImageClient<$Result.GetResult<Prisma.$RequestImagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first RequestImage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestImageFindFirstArgs} args - Arguments to find a RequestImage
     * @example
     * // Get one RequestImage
     * const requestImage = await prisma.requestImage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RequestImageFindFirstArgs>(args?: SelectSubset<T, RequestImageFindFirstArgs<ExtArgs>>): Prisma__RequestImageClient<$Result.GetResult<Prisma.$RequestImagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first RequestImage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestImageFindFirstOrThrowArgs} args - Arguments to find a RequestImage
     * @example
     * // Get one RequestImage
     * const requestImage = await prisma.requestImage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RequestImageFindFirstOrThrowArgs>(args?: SelectSubset<T, RequestImageFindFirstOrThrowArgs<ExtArgs>>): Prisma__RequestImageClient<$Result.GetResult<Prisma.$RequestImagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more RequestImages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestImageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RequestImages
     * const requestImages = await prisma.requestImage.findMany()
     * 
     * // Get first 10 RequestImages
     * const requestImages = await prisma.requestImage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const requestImageWithIdOnly = await prisma.requestImage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RequestImageFindManyArgs>(args?: SelectSubset<T, RequestImageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestImagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a RequestImage.
     * @param {RequestImageCreateArgs} args - Arguments to create a RequestImage.
     * @example
     * // Create one RequestImage
     * const RequestImage = await prisma.requestImage.create({
     *   data: {
     *     // ... data to create a RequestImage
     *   }
     * })
     * 
     */
    create<T extends RequestImageCreateArgs>(args: SelectSubset<T, RequestImageCreateArgs<ExtArgs>>): Prisma__RequestImageClient<$Result.GetResult<Prisma.$RequestImagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many RequestImages.
     * @param {RequestImageCreateManyArgs} args - Arguments to create many RequestImages.
     * @example
     * // Create many RequestImages
     * const requestImage = await prisma.requestImage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RequestImageCreateManyArgs>(args?: SelectSubset<T, RequestImageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RequestImages and returns the data saved in the database.
     * @param {RequestImageCreateManyAndReturnArgs} args - Arguments to create many RequestImages.
     * @example
     * // Create many RequestImages
     * const requestImage = await prisma.requestImage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RequestImages and only return the `id`
     * const requestImageWithIdOnly = await prisma.requestImage.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RequestImageCreateManyAndReturnArgs>(args?: SelectSubset<T, RequestImageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestImagePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a RequestImage.
     * @param {RequestImageDeleteArgs} args - Arguments to delete one RequestImage.
     * @example
     * // Delete one RequestImage
     * const RequestImage = await prisma.requestImage.delete({
     *   where: {
     *     // ... filter to delete one RequestImage
     *   }
     * })
     * 
     */
    delete<T extends RequestImageDeleteArgs>(args: SelectSubset<T, RequestImageDeleteArgs<ExtArgs>>): Prisma__RequestImageClient<$Result.GetResult<Prisma.$RequestImagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one RequestImage.
     * @param {RequestImageUpdateArgs} args - Arguments to update one RequestImage.
     * @example
     * // Update one RequestImage
     * const requestImage = await prisma.requestImage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RequestImageUpdateArgs>(args: SelectSubset<T, RequestImageUpdateArgs<ExtArgs>>): Prisma__RequestImageClient<$Result.GetResult<Prisma.$RequestImagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more RequestImages.
     * @param {RequestImageDeleteManyArgs} args - Arguments to filter RequestImages to delete.
     * @example
     * // Delete a few RequestImages
     * const { count } = await prisma.requestImage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RequestImageDeleteManyArgs>(args?: SelectSubset<T, RequestImageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RequestImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestImageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RequestImages
     * const requestImage = await prisma.requestImage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RequestImageUpdateManyArgs>(args: SelectSubset<T, RequestImageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one RequestImage.
     * @param {RequestImageUpsertArgs} args - Arguments to update or create a RequestImage.
     * @example
     * // Update or create a RequestImage
     * const requestImage = await prisma.requestImage.upsert({
     *   create: {
     *     // ... data to create a RequestImage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RequestImage we want to update
     *   }
     * })
     */
    upsert<T extends RequestImageUpsertArgs>(args: SelectSubset<T, RequestImageUpsertArgs<ExtArgs>>): Prisma__RequestImageClient<$Result.GetResult<Prisma.$RequestImagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of RequestImages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestImageCountArgs} args - Arguments to filter RequestImages to count.
     * @example
     * // Count the number of RequestImages
     * const count = await prisma.requestImage.count({
     *   where: {
     *     // ... the filter for the RequestImages we want to count
     *   }
     * })
    **/
    count<T extends RequestImageCountArgs>(
      args?: Subset<T, RequestImageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RequestImageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RequestImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestImageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RequestImageAggregateArgs>(args: Subset<T, RequestImageAggregateArgs>): Prisma.PrismaPromise<GetRequestImageAggregateType<T>>

    /**
     * Group by RequestImage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestImageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RequestImageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RequestImageGroupByArgs['orderBy'] }
        : { orderBy?: RequestImageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RequestImageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRequestImageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RequestImage model
   */
  readonly fields: RequestImageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RequestImage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RequestImageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    request<T extends RequestDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RequestDefaultArgs<ExtArgs>>): Prisma__RequestClient<$Result.GetResult<Prisma.$RequestPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RequestImage model
   */ 
  interface RequestImageFieldRefs {
    readonly id: FieldRef<"RequestImage", 'String'>
    readonly requestId: FieldRef<"RequestImage", 'String'>
    readonly imageUrl: FieldRef<"RequestImage", 'String'>
    readonly thumbnailUrl: FieldRef<"RequestImage", 'String'>
    readonly originalFilename: FieldRef<"RequestImage", 'String'>
    readonly fileSize: FieldRef<"RequestImage", 'BigInt'>
    readonly mimeType: FieldRef<"RequestImage", 'String'>
    readonly width: FieldRef<"RequestImage", 'Int'>
    readonly height: FieldRef<"RequestImage", 'Int'>
    readonly sortOrder: FieldRef<"RequestImage", 'Int'>
    readonly isPrimary: FieldRef<"RequestImage", 'Boolean'>
    readonly createdAt: FieldRef<"RequestImage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RequestImage findUnique
   */
  export type RequestImageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestImage
     */
    select?: RequestImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestImageInclude<ExtArgs> | null
    /**
     * Filter, which RequestImage to fetch.
     */
    where: RequestImageWhereUniqueInput
  }

  /**
   * RequestImage findUniqueOrThrow
   */
  export type RequestImageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestImage
     */
    select?: RequestImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestImageInclude<ExtArgs> | null
    /**
     * Filter, which RequestImage to fetch.
     */
    where: RequestImageWhereUniqueInput
  }

  /**
   * RequestImage findFirst
   */
  export type RequestImageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestImage
     */
    select?: RequestImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestImageInclude<ExtArgs> | null
    /**
     * Filter, which RequestImage to fetch.
     */
    where?: RequestImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestImages to fetch.
     */
    orderBy?: RequestImageOrderByWithRelationInput | RequestImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RequestImages.
     */
    cursor?: RequestImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequestImages.
     */
    distinct?: RequestImageScalarFieldEnum | RequestImageScalarFieldEnum[]
  }

  /**
   * RequestImage findFirstOrThrow
   */
  export type RequestImageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestImage
     */
    select?: RequestImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestImageInclude<ExtArgs> | null
    /**
     * Filter, which RequestImage to fetch.
     */
    where?: RequestImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestImages to fetch.
     */
    orderBy?: RequestImageOrderByWithRelationInput | RequestImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RequestImages.
     */
    cursor?: RequestImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestImages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequestImages.
     */
    distinct?: RequestImageScalarFieldEnum | RequestImageScalarFieldEnum[]
  }

  /**
   * RequestImage findMany
   */
  export type RequestImageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestImage
     */
    select?: RequestImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestImageInclude<ExtArgs> | null
    /**
     * Filter, which RequestImages to fetch.
     */
    where?: RequestImageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestImages to fetch.
     */
    orderBy?: RequestImageOrderByWithRelationInput | RequestImageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RequestImages.
     */
    cursor?: RequestImageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestImages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestImages.
     */
    skip?: number
    distinct?: RequestImageScalarFieldEnum | RequestImageScalarFieldEnum[]
  }

  /**
   * RequestImage create
   */
  export type RequestImageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestImage
     */
    select?: RequestImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestImageInclude<ExtArgs> | null
    /**
     * The data needed to create a RequestImage.
     */
    data: XOR<RequestImageCreateInput, RequestImageUncheckedCreateInput>
  }

  /**
   * RequestImage createMany
   */
  export type RequestImageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RequestImages.
     */
    data: RequestImageCreateManyInput | RequestImageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RequestImage createManyAndReturn
   */
  export type RequestImageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestImage
     */
    select?: RequestImageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many RequestImages.
     */
    data: RequestImageCreateManyInput | RequestImageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestImageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RequestImage update
   */
  export type RequestImageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestImage
     */
    select?: RequestImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestImageInclude<ExtArgs> | null
    /**
     * The data needed to update a RequestImage.
     */
    data: XOR<RequestImageUpdateInput, RequestImageUncheckedUpdateInput>
    /**
     * Choose, which RequestImage to update.
     */
    where: RequestImageWhereUniqueInput
  }

  /**
   * RequestImage updateMany
   */
  export type RequestImageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RequestImages.
     */
    data: XOR<RequestImageUpdateManyMutationInput, RequestImageUncheckedUpdateManyInput>
    /**
     * Filter which RequestImages to update
     */
    where?: RequestImageWhereInput
  }

  /**
   * RequestImage upsert
   */
  export type RequestImageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestImage
     */
    select?: RequestImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestImageInclude<ExtArgs> | null
    /**
     * The filter to search for the RequestImage to update in case it exists.
     */
    where: RequestImageWhereUniqueInput
    /**
     * In case the RequestImage found by the `where` argument doesn't exist, create a new RequestImage with this data.
     */
    create: XOR<RequestImageCreateInput, RequestImageUncheckedCreateInput>
    /**
     * In case the RequestImage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RequestImageUpdateInput, RequestImageUncheckedUpdateInput>
  }

  /**
   * RequestImage delete
   */
  export type RequestImageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestImage
     */
    select?: RequestImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestImageInclude<ExtArgs> | null
    /**
     * Filter which RequestImage to delete.
     */
    where: RequestImageWhereUniqueInput
  }

  /**
   * RequestImage deleteMany
   */
  export type RequestImageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RequestImages to delete
     */
    where?: RequestImageWhereInput
  }

  /**
   * RequestImage without action
   */
  export type RequestImageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestImage
     */
    select?: RequestImageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestImageInclude<ExtArgs> | null
  }


  /**
   * Model RequestDraft
   */

  export type AggregateRequestDraft = {
    _count: RequestDraftCountAggregateOutputType | null
    _avg: RequestDraftAvgAggregateOutputType | null
    _sum: RequestDraftSumAggregateOutputType | null
    _min: RequestDraftMinAggregateOutputType | null
    _max: RequestDraftMaxAggregateOutputType | null
  }

  export type RequestDraftAvgAggregateOutputType = {
    budgetMin: Decimal | null
    budgetMax: Decimal | null
    locationLat: Decimal | null
    locationLng: Decimal | null
  }

  export type RequestDraftSumAggregateOutputType = {
    budgetMin: Decimal | null
    budgetMax: Decimal | null
    locationLat: Decimal | null
    locationLng: Decimal | null
  }

  export type RequestDraftMinAggregateOutputType = {
    id: string | null
    buyerId: string | null
    categoryId: string | null
    title: string | null
    description: string | null
    budgetMin: Decimal | null
    budgetMax: Decimal | null
    locationLat: Decimal | null
    locationLng: Decimal | null
    locationAddress: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RequestDraftMaxAggregateOutputType = {
    id: string | null
    buyerId: string | null
    categoryId: string | null
    title: string | null
    description: string | null
    budgetMin: Decimal | null
    budgetMax: Decimal | null
    locationLat: Decimal | null
    locationLng: Decimal | null
    locationAddress: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type RequestDraftCountAggregateOutputType = {
    id: number
    buyerId: number
    categoryId: number
    title: number
    description: number
    budgetMin: number
    budgetMax: number
    locationLat: number
    locationLng: number
    locationAddress: number
    autoSaveData: number
    expiresAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type RequestDraftAvgAggregateInputType = {
    budgetMin?: true
    budgetMax?: true
    locationLat?: true
    locationLng?: true
  }

  export type RequestDraftSumAggregateInputType = {
    budgetMin?: true
    budgetMax?: true
    locationLat?: true
    locationLng?: true
  }

  export type RequestDraftMinAggregateInputType = {
    id?: true
    buyerId?: true
    categoryId?: true
    title?: true
    description?: true
    budgetMin?: true
    budgetMax?: true
    locationLat?: true
    locationLng?: true
    locationAddress?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RequestDraftMaxAggregateInputType = {
    id?: true
    buyerId?: true
    categoryId?: true
    title?: true
    description?: true
    budgetMin?: true
    budgetMax?: true
    locationLat?: true
    locationLng?: true
    locationAddress?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type RequestDraftCountAggregateInputType = {
    id?: true
    buyerId?: true
    categoryId?: true
    title?: true
    description?: true
    budgetMin?: true
    budgetMax?: true
    locationLat?: true
    locationLng?: true
    locationAddress?: true
    autoSaveData?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type RequestDraftAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RequestDraft to aggregate.
     */
    where?: RequestDraftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestDrafts to fetch.
     */
    orderBy?: RequestDraftOrderByWithRelationInput | RequestDraftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RequestDraftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestDrafts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestDrafts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RequestDrafts
    **/
    _count?: true | RequestDraftCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RequestDraftAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RequestDraftSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RequestDraftMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RequestDraftMaxAggregateInputType
  }

  export type GetRequestDraftAggregateType<T extends RequestDraftAggregateArgs> = {
        [P in keyof T & keyof AggregateRequestDraft]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRequestDraft[P]>
      : GetScalarType<T[P], AggregateRequestDraft[P]>
  }




  export type RequestDraftGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequestDraftWhereInput
    orderBy?: RequestDraftOrderByWithAggregationInput | RequestDraftOrderByWithAggregationInput[]
    by: RequestDraftScalarFieldEnum[] | RequestDraftScalarFieldEnum
    having?: RequestDraftScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RequestDraftCountAggregateInputType | true
    _avg?: RequestDraftAvgAggregateInputType
    _sum?: RequestDraftSumAggregateInputType
    _min?: RequestDraftMinAggregateInputType
    _max?: RequestDraftMaxAggregateInputType
  }

  export type RequestDraftGroupByOutputType = {
    id: string
    buyerId: string
    categoryId: string | null
    title: string | null
    description: string | null
    budgetMin: Decimal | null
    budgetMax: Decimal | null
    locationLat: Decimal | null
    locationLng: Decimal | null
    locationAddress: string | null
    autoSaveData: JsonValue
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
    _count: RequestDraftCountAggregateOutputType | null
    _avg: RequestDraftAvgAggregateOutputType | null
    _sum: RequestDraftSumAggregateOutputType | null
    _min: RequestDraftMinAggregateOutputType | null
    _max: RequestDraftMaxAggregateOutputType | null
  }

  type GetRequestDraftGroupByPayload<T extends RequestDraftGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RequestDraftGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RequestDraftGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RequestDraftGroupByOutputType[P]>
            : GetScalarType<T[P], RequestDraftGroupByOutputType[P]>
        }
      >
    >


  export type RequestDraftSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    buyerId?: boolean
    categoryId?: boolean
    title?: boolean
    description?: boolean
    budgetMin?: boolean
    budgetMax?: boolean
    locationLat?: boolean
    locationLng?: boolean
    locationAddress?: boolean
    autoSaveData?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | RequestDraft$categoryArgs<ExtArgs>
  }, ExtArgs["result"]["requestDraft"]>

  export type RequestDraftSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    buyerId?: boolean
    categoryId?: boolean
    title?: boolean
    description?: boolean
    budgetMin?: boolean
    budgetMax?: boolean
    locationLat?: boolean
    locationLng?: boolean
    locationAddress?: boolean
    autoSaveData?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | RequestDraft$categoryArgs<ExtArgs>
  }, ExtArgs["result"]["requestDraft"]>

  export type RequestDraftSelectScalar = {
    id?: boolean
    buyerId?: boolean
    categoryId?: boolean
    title?: boolean
    description?: boolean
    budgetMin?: boolean
    budgetMax?: boolean
    locationLat?: boolean
    locationLng?: boolean
    locationAddress?: boolean
    autoSaveData?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type RequestDraftInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | RequestDraft$categoryArgs<ExtArgs>
  }
  export type RequestDraftIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | RequestDraft$categoryArgs<ExtArgs>
  }

  export type $RequestDraftPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RequestDraft"
    objects: {
      category: Prisma.$RequestCategoryPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      buyerId: string
      categoryId: string | null
      title: string | null
      description: string | null
      budgetMin: Prisma.Decimal | null
      budgetMax: Prisma.Decimal | null
      locationLat: Prisma.Decimal | null
      locationLng: Prisma.Decimal | null
      locationAddress: string | null
      autoSaveData: Prisma.JsonValue
      expiresAt: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["requestDraft"]>
    composites: {}
  }

  type RequestDraftGetPayload<S extends boolean | null | undefined | RequestDraftDefaultArgs> = $Result.GetResult<Prisma.$RequestDraftPayload, S>

  type RequestDraftCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RequestDraftFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RequestDraftCountAggregateInputType | true
    }

  export interface RequestDraftDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RequestDraft'], meta: { name: 'RequestDraft' } }
    /**
     * Find zero or one RequestDraft that matches the filter.
     * @param {RequestDraftFindUniqueArgs} args - Arguments to find a RequestDraft
     * @example
     * // Get one RequestDraft
     * const requestDraft = await prisma.requestDraft.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RequestDraftFindUniqueArgs>(args: SelectSubset<T, RequestDraftFindUniqueArgs<ExtArgs>>): Prisma__RequestDraftClient<$Result.GetResult<Prisma.$RequestDraftPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one RequestDraft that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RequestDraftFindUniqueOrThrowArgs} args - Arguments to find a RequestDraft
     * @example
     * // Get one RequestDraft
     * const requestDraft = await prisma.requestDraft.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RequestDraftFindUniqueOrThrowArgs>(args: SelectSubset<T, RequestDraftFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RequestDraftClient<$Result.GetResult<Prisma.$RequestDraftPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first RequestDraft that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestDraftFindFirstArgs} args - Arguments to find a RequestDraft
     * @example
     * // Get one RequestDraft
     * const requestDraft = await prisma.requestDraft.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RequestDraftFindFirstArgs>(args?: SelectSubset<T, RequestDraftFindFirstArgs<ExtArgs>>): Prisma__RequestDraftClient<$Result.GetResult<Prisma.$RequestDraftPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first RequestDraft that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestDraftFindFirstOrThrowArgs} args - Arguments to find a RequestDraft
     * @example
     * // Get one RequestDraft
     * const requestDraft = await prisma.requestDraft.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RequestDraftFindFirstOrThrowArgs>(args?: SelectSubset<T, RequestDraftFindFirstOrThrowArgs<ExtArgs>>): Prisma__RequestDraftClient<$Result.GetResult<Prisma.$RequestDraftPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more RequestDrafts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestDraftFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RequestDrafts
     * const requestDrafts = await prisma.requestDraft.findMany()
     * 
     * // Get first 10 RequestDrafts
     * const requestDrafts = await prisma.requestDraft.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const requestDraftWithIdOnly = await prisma.requestDraft.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RequestDraftFindManyArgs>(args?: SelectSubset<T, RequestDraftFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestDraftPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a RequestDraft.
     * @param {RequestDraftCreateArgs} args - Arguments to create a RequestDraft.
     * @example
     * // Create one RequestDraft
     * const RequestDraft = await prisma.requestDraft.create({
     *   data: {
     *     // ... data to create a RequestDraft
     *   }
     * })
     * 
     */
    create<T extends RequestDraftCreateArgs>(args: SelectSubset<T, RequestDraftCreateArgs<ExtArgs>>): Prisma__RequestDraftClient<$Result.GetResult<Prisma.$RequestDraftPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many RequestDrafts.
     * @param {RequestDraftCreateManyArgs} args - Arguments to create many RequestDrafts.
     * @example
     * // Create many RequestDrafts
     * const requestDraft = await prisma.requestDraft.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RequestDraftCreateManyArgs>(args?: SelectSubset<T, RequestDraftCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RequestDrafts and returns the data saved in the database.
     * @param {RequestDraftCreateManyAndReturnArgs} args - Arguments to create many RequestDrafts.
     * @example
     * // Create many RequestDrafts
     * const requestDraft = await prisma.requestDraft.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RequestDrafts and only return the `id`
     * const requestDraftWithIdOnly = await prisma.requestDraft.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RequestDraftCreateManyAndReturnArgs>(args?: SelectSubset<T, RequestDraftCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestDraftPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a RequestDraft.
     * @param {RequestDraftDeleteArgs} args - Arguments to delete one RequestDraft.
     * @example
     * // Delete one RequestDraft
     * const RequestDraft = await prisma.requestDraft.delete({
     *   where: {
     *     // ... filter to delete one RequestDraft
     *   }
     * })
     * 
     */
    delete<T extends RequestDraftDeleteArgs>(args: SelectSubset<T, RequestDraftDeleteArgs<ExtArgs>>): Prisma__RequestDraftClient<$Result.GetResult<Prisma.$RequestDraftPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one RequestDraft.
     * @param {RequestDraftUpdateArgs} args - Arguments to update one RequestDraft.
     * @example
     * // Update one RequestDraft
     * const requestDraft = await prisma.requestDraft.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RequestDraftUpdateArgs>(args: SelectSubset<T, RequestDraftUpdateArgs<ExtArgs>>): Prisma__RequestDraftClient<$Result.GetResult<Prisma.$RequestDraftPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more RequestDrafts.
     * @param {RequestDraftDeleteManyArgs} args - Arguments to filter RequestDrafts to delete.
     * @example
     * // Delete a few RequestDrafts
     * const { count } = await prisma.requestDraft.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RequestDraftDeleteManyArgs>(args?: SelectSubset<T, RequestDraftDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RequestDrafts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestDraftUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RequestDrafts
     * const requestDraft = await prisma.requestDraft.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RequestDraftUpdateManyArgs>(args: SelectSubset<T, RequestDraftUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one RequestDraft.
     * @param {RequestDraftUpsertArgs} args - Arguments to update or create a RequestDraft.
     * @example
     * // Update or create a RequestDraft
     * const requestDraft = await prisma.requestDraft.upsert({
     *   create: {
     *     // ... data to create a RequestDraft
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RequestDraft we want to update
     *   }
     * })
     */
    upsert<T extends RequestDraftUpsertArgs>(args: SelectSubset<T, RequestDraftUpsertArgs<ExtArgs>>): Prisma__RequestDraftClient<$Result.GetResult<Prisma.$RequestDraftPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of RequestDrafts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestDraftCountArgs} args - Arguments to filter RequestDrafts to count.
     * @example
     * // Count the number of RequestDrafts
     * const count = await prisma.requestDraft.count({
     *   where: {
     *     // ... the filter for the RequestDrafts we want to count
     *   }
     * })
    **/
    count<T extends RequestDraftCountArgs>(
      args?: Subset<T, RequestDraftCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RequestDraftCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RequestDraft.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestDraftAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RequestDraftAggregateArgs>(args: Subset<T, RequestDraftAggregateArgs>): Prisma.PrismaPromise<GetRequestDraftAggregateType<T>>

    /**
     * Group by RequestDraft.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestDraftGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RequestDraftGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RequestDraftGroupByArgs['orderBy'] }
        : { orderBy?: RequestDraftGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RequestDraftGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRequestDraftGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RequestDraft model
   */
  readonly fields: RequestDraftFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RequestDraft.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RequestDraftClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    category<T extends RequestDraft$categoryArgs<ExtArgs> = {}>(args?: Subset<T, RequestDraft$categoryArgs<ExtArgs>>): Prisma__RequestCategoryClient<$Result.GetResult<Prisma.$RequestCategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RequestDraft model
   */ 
  interface RequestDraftFieldRefs {
    readonly id: FieldRef<"RequestDraft", 'String'>
    readonly buyerId: FieldRef<"RequestDraft", 'String'>
    readonly categoryId: FieldRef<"RequestDraft", 'String'>
    readonly title: FieldRef<"RequestDraft", 'String'>
    readonly description: FieldRef<"RequestDraft", 'String'>
    readonly budgetMin: FieldRef<"RequestDraft", 'Decimal'>
    readonly budgetMax: FieldRef<"RequestDraft", 'Decimal'>
    readonly locationLat: FieldRef<"RequestDraft", 'Decimal'>
    readonly locationLng: FieldRef<"RequestDraft", 'Decimal'>
    readonly locationAddress: FieldRef<"RequestDraft", 'String'>
    readonly autoSaveData: FieldRef<"RequestDraft", 'Json'>
    readonly expiresAt: FieldRef<"RequestDraft", 'DateTime'>
    readonly createdAt: FieldRef<"RequestDraft", 'DateTime'>
    readonly updatedAt: FieldRef<"RequestDraft", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RequestDraft findUnique
   */
  export type RequestDraftFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestDraft
     */
    select?: RequestDraftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestDraftInclude<ExtArgs> | null
    /**
     * Filter, which RequestDraft to fetch.
     */
    where: RequestDraftWhereUniqueInput
  }

  /**
   * RequestDraft findUniqueOrThrow
   */
  export type RequestDraftFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestDraft
     */
    select?: RequestDraftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestDraftInclude<ExtArgs> | null
    /**
     * Filter, which RequestDraft to fetch.
     */
    where: RequestDraftWhereUniqueInput
  }

  /**
   * RequestDraft findFirst
   */
  export type RequestDraftFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestDraft
     */
    select?: RequestDraftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestDraftInclude<ExtArgs> | null
    /**
     * Filter, which RequestDraft to fetch.
     */
    where?: RequestDraftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestDrafts to fetch.
     */
    orderBy?: RequestDraftOrderByWithRelationInput | RequestDraftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RequestDrafts.
     */
    cursor?: RequestDraftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestDrafts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestDrafts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequestDrafts.
     */
    distinct?: RequestDraftScalarFieldEnum | RequestDraftScalarFieldEnum[]
  }

  /**
   * RequestDraft findFirstOrThrow
   */
  export type RequestDraftFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestDraft
     */
    select?: RequestDraftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestDraftInclude<ExtArgs> | null
    /**
     * Filter, which RequestDraft to fetch.
     */
    where?: RequestDraftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestDrafts to fetch.
     */
    orderBy?: RequestDraftOrderByWithRelationInput | RequestDraftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RequestDrafts.
     */
    cursor?: RequestDraftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestDrafts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestDrafts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequestDrafts.
     */
    distinct?: RequestDraftScalarFieldEnum | RequestDraftScalarFieldEnum[]
  }

  /**
   * RequestDraft findMany
   */
  export type RequestDraftFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestDraft
     */
    select?: RequestDraftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestDraftInclude<ExtArgs> | null
    /**
     * Filter, which RequestDrafts to fetch.
     */
    where?: RequestDraftWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestDrafts to fetch.
     */
    orderBy?: RequestDraftOrderByWithRelationInput | RequestDraftOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RequestDrafts.
     */
    cursor?: RequestDraftWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestDrafts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestDrafts.
     */
    skip?: number
    distinct?: RequestDraftScalarFieldEnum | RequestDraftScalarFieldEnum[]
  }

  /**
   * RequestDraft create
   */
  export type RequestDraftCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestDraft
     */
    select?: RequestDraftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestDraftInclude<ExtArgs> | null
    /**
     * The data needed to create a RequestDraft.
     */
    data: XOR<RequestDraftCreateInput, RequestDraftUncheckedCreateInput>
  }

  /**
   * RequestDraft createMany
   */
  export type RequestDraftCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RequestDrafts.
     */
    data: RequestDraftCreateManyInput | RequestDraftCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RequestDraft createManyAndReturn
   */
  export type RequestDraftCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestDraft
     */
    select?: RequestDraftSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many RequestDrafts.
     */
    data: RequestDraftCreateManyInput | RequestDraftCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestDraftIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RequestDraft update
   */
  export type RequestDraftUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestDraft
     */
    select?: RequestDraftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestDraftInclude<ExtArgs> | null
    /**
     * The data needed to update a RequestDraft.
     */
    data: XOR<RequestDraftUpdateInput, RequestDraftUncheckedUpdateInput>
    /**
     * Choose, which RequestDraft to update.
     */
    where: RequestDraftWhereUniqueInput
  }

  /**
   * RequestDraft updateMany
   */
  export type RequestDraftUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RequestDrafts.
     */
    data: XOR<RequestDraftUpdateManyMutationInput, RequestDraftUncheckedUpdateManyInput>
    /**
     * Filter which RequestDrafts to update
     */
    where?: RequestDraftWhereInput
  }

  /**
   * RequestDraft upsert
   */
  export type RequestDraftUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestDraft
     */
    select?: RequestDraftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestDraftInclude<ExtArgs> | null
    /**
     * The filter to search for the RequestDraft to update in case it exists.
     */
    where: RequestDraftWhereUniqueInput
    /**
     * In case the RequestDraft found by the `where` argument doesn't exist, create a new RequestDraft with this data.
     */
    create: XOR<RequestDraftCreateInput, RequestDraftUncheckedCreateInput>
    /**
     * In case the RequestDraft was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RequestDraftUpdateInput, RequestDraftUncheckedUpdateInput>
  }

  /**
   * RequestDraft delete
   */
  export type RequestDraftDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestDraft
     */
    select?: RequestDraftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestDraftInclude<ExtArgs> | null
    /**
     * Filter which RequestDraft to delete.
     */
    where: RequestDraftWhereUniqueInput
  }

  /**
   * RequestDraft deleteMany
   */
  export type RequestDraftDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RequestDrafts to delete
     */
    where?: RequestDraftWhereInput
  }

  /**
   * RequestDraft.category
   */
  export type RequestDraft$categoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestCategory
     */
    select?: RequestCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestCategoryInclude<ExtArgs> | null
    where?: RequestCategoryWhereInput
  }

  /**
   * RequestDraft without action
   */
  export type RequestDraftDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestDraft
     */
    select?: RequestDraftSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestDraftInclude<ExtArgs> | null
  }


  /**
   * Model RequestExtension
   */

  export type AggregateRequestExtension = {
    _count: RequestExtensionCountAggregateOutputType | null
    _min: RequestExtensionMinAggregateOutputType | null
    _max: RequestExtensionMaxAggregateOutputType | null
  }

  export type RequestExtensionMinAggregateOutputType = {
    id: string | null
    requestId: string | null
    originalExpiresAt: Date | null
    newExpiresAt: Date | null
    extensionReason: string | null
    extendedBy: string | null
    createdAt: Date | null
  }

  export type RequestExtensionMaxAggregateOutputType = {
    id: string | null
    requestId: string | null
    originalExpiresAt: Date | null
    newExpiresAt: Date | null
    extensionReason: string | null
    extendedBy: string | null
    createdAt: Date | null
  }

  export type RequestExtensionCountAggregateOutputType = {
    id: number
    requestId: number
    originalExpiresAt: number
    newExpiresAt: number
    extensionReason: number
    extendedBy: number
    createdAt: number
    _all: number
  }


  export type RequestExtensionMinAggregateInputType = {
    id?: true
    requestId?: true
    originalExpiresAt?: true
    newExpiresAt?: true
    extensionReason?: true
    extendedBy?: true
    createdAt?: true
  }

  export type RequestExtensionMaxAggregateInputType = {
    id?: true
    requestId?: true
    originalExpiresAt?: true
    newExpiresAt?: true
    extensionReason?: true
    extendedBy?: true
    createdAt?: true
  }

  export type RequestExtensionCountAggregateInputType = {
    id?: true
    requestId?: true
    originalExpiresAt?: true
    newExpiresAt?: true
    extensionReason?: true
    extendedBy?: true
    createdAt?: true
    _all?: true
  }

  export type RequestExtensionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RequestExtension to aggregate.
     */
    where?: RequestExtensionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestExtensions to fetch.
     */
    orderBy?: RequestExtensionOrderByWithRelationInput | RequestExtensionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RequestExtensionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestExtensions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestExtensions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RequestExtensions
    **/
    _count?: true | RequestExtensionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RequestExtensionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RequestExtensionMaxAggregateInputType
  }

  export type GetRequestExtensionAggregateType<T extends RequestExtensionAggregateArgs> = {
        [P in keyof T & keyof AggregateRequestExtension]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRequestExtension[P]>
      : GetScalarType<T[P], AggregateRequestExtension[P]>
  }




  export type RequestExtensionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequestExtensionWhereInput
    orderBy?: RequestExtensionOrderByWithAggregationInput | RequestExtensionOrderByWithAggregationInput[]
    by: RequestExtensionScalarFieldEnum[] | RequestExtensionScalarFieldEnum
    having?: RequestExtensionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RequestExtensionCountAggregateInputType | true
    _min?: RequestExtensionMinAggregateInputType
    _max?: RequestExtensionMaxAggregateInputType
  }

  export type RequestExtensionGroupByOutputType = {
    id: string
    requestId: string
    originalExpiresAt: Date
    newExpiresAt: Date
    extensionReason: string | null
    extendedBy: string | null
    createdAt: Date
    _count: RequestExtensionCountAggregateOutputType | null
    _min: RequestExtensionMinAggregateOutputType | null
    _max: RequestExtensionMaxAggregateOutputType | null
  }

  type GetRequestExtensionGroupByPayload<T extends RequestExtensionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RequestExtensionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RequestExtensionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RequestExtensionGroupByOutputType[P]>
            : GetScalarType<T[P], RequestExtensionGroupByOutputType[P]>
        }
      >
    >


  export type RequestExtensionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    requestId?: boolean
    originalExpiresAt?: boolean
    newExpiresAt?: boolean
    extensionReason?: boolean
    extendedBy?: boolean
    createdAt?: boolean
    request?: boolean | RequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["requestExtension"]>

  export type RequestExtensionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    requestId?: boolean
    originalExpiresAt?: boolean
    newExpiresAt?: boolean
    extensionReason?: boolean
    extendedBy?: boolean
    createdAt?: boolean
    request?: boolean | RequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["requestExtension"]>

  export type RequestExtensionSelectScalar = {
    id?: boolean
    requestId?: boolean
    originalExpiresAt?: boolean
    newExpiresAt?: boolean
    extensionReason?: boolean
    extendedBy?: boolean
    createdAt?: boolean
  }

  export type RequestExtensionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    request?: boolean | RequestDefaultArgs<ExtArgs>
  }
  export type RequestExtensionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    request?: boolean | RequestDefaultArgs<ExtArgs>
  }

  export type $RequestExtensionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RequestExtension"
    objects: {
      request: Prisma.$RequestPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      requestId: string
      originalExpiresAt: Date
      newExpiresAt: Date
      extensionReason: string | null
      extendedBy: string | null
      createdAt: Date
    }, ExtArgs["result"]["requestExtension"]>
    composites: {}
  }

  type RequestExtensionGetPayload<S extends boolean | null | undefined | RequestExtensionDefaultArgs> = $Result.GetResult<Prisma.$RequestExtensionPayload, S>

  type RequestExtensionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RequestExtensionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RequestExtensionCountAggregateInputType | true
    }

  export interface RequestExtensionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RequestExtension'], meta: { name: 'RequestExtension' } }
    /**
     * Find zero or one RequestExtension that matches the filter.
     * @param {RequestExtensionFindUniqueArgs} args - Arguments to find a RequestExtension
     * @example
     * // Get one RequestExtension
     * const requestExtension = await prisma.requestExtension.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RequestExtensionFindUniqueArgs>(args: SelectSubset<T, RequestExtensionFindUniqueArgs<ExtArgs>>): Prisma__RequestExtensionClient<$Result.GetResult<Prisma.$RequestExtensionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one RequestExtension that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RequestExtensionFindUniqueOrThrowArgs} args - Arguments to find a RequestExtension
     * @example
     * // Get one RequestExtension
     * const requestExtension = await prisma.requestExtension.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RequestExtensionFindUniqueOrThrowArgs>(args: SelectSubset<T, RequestExtensionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RequestExtensionClient<$Result.GetResult<Prisma.$RequestExtensionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first RequestExtension that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestExtensionFindFirstArgs} args - Arguments to find a RequestExtension
     * @example
     * // Get one RequestExtension
     * const requestExtension = await prisma.requestExtension.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RequestExtensionFindFirstArgs>(args?: SelectSubset<T, RequestExtensionFindFirstArgs<ExtArgs>>): Prisma__RequestExtensionClient<$Result.GetResult<Prisma.$RequestExtensionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first RequestExtension that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestExtensionFindFirstOrThrowArgs} args - Arguments to find a RequestExtension
     * @example
     * // Get one RequestExtension
     * const requestExtension = await prisma.requestExtension.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RequestExtensionFindFirstOrThrowArgs>(args?: SelectSubset<T, RequestExtensionFindFirstOrThrowArgs<ExtArgs>>): Prisma__RequestExtensionClient<$Result.GetResult<Prisma.$RequestExtensionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more RequestExtensions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestExtensionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RequestExtensions
     * const requestExtensions = await prisma.requestExtension.findMany()
     * 
     * // Get first 10 RequestExtensions
     * const requestExtensions = await prisma.requestExtension.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const requestExtensionWithIdOnly = await prisma.requestExtension.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RequestExtensionFindManyArgs>(args?: SelectSubset<T, RequestExtensionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestExtensionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a RequestExtension.
     * @param {RequestExtensionCreateArgs} args - Arguments to create a RequestExtension.
     * @example
     * // Create one RequestExtension
     * const RequestExtension = await prisma.requestExtension.create({
     *   data: {
     *     // ... data to create a RequestExtension
     *   }
     * })
     * 
     */
    create<T extends RequestExtensionCreateArgs>(args: SelectSubset<T, RequestExtensionCreateArgs<ExtArgs>>): Prisma__RequestExtensionClient<$Result.GetResult<Prisma.$RequestExtensionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many RequestExtensions.
     * @param {RequestExtensionCreateManyArgs} args - Arguments to create many RequestExtensions.
     * @example
     * // Create many RequestExtensions
     * const requestExtension = await prisma.requestExtension.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RequestExtensionCreateManyArgs>(args?: SelectSubset<T, RequestExtensionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RequestExtensions and returns the data saved in the database.
     * @param {RequestExtensionCreateManyAndReturnArgs} args - Arguments to create many RequestExtensions.
     * @example
     * // Create many RequestExtensions
     * const requestExtension = await prisma.requestExtension.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RequestExtensions and only return the `id`
     * const requestExtensionWithIdOnly = await prisma.requestExtension.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RequestExtensionCreateManyAndReturnArgs>(args?: SelectSubset<T, RequestExtensionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestExtensionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a RequestExtension.
     * @param {RequestExtensionDeleteArgs} args - Arguments to delete one RequestExtension.
     * @example
     * // Delete one RequestExtension
     * const RequestExtension = await prisma.requestExtension.delete({
     *   where: {
     *     // ... filter to delete one RequestExtension
     *   }
     * })
     * 
     */
    delete<T extends RequestExtensionDeleteArgs>(args: SelectSubset<T, RequestExtensionDeleteArgs<ExtArgs>>): Prisma__RequestExtensionClient<$Result.GetResult<Prisma.$RequestExtensionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one RequestExtension.
     * @param {RequestExtensionUpdateArgs} args - Arguments to update one RequestExtension.
     * @example
     * // Update one RequestExtension
     * const requestExtension = await prisma.requestExtension.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RequestExtensionUpdateArgs>(args: SelectSubset<T, RequestExtensionUpdateArgs<ExtArgs>>): Prisma__RequestExtensionClient<$Result.GetResult<Prisma.$RequestExtensionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more RequestExtensions.
     * @param {RequestExtensionDeleteManyArgs} args - Arguments to filter RequestExtensions to delete.
     * @example
     * // Delete a few RequestExtensions
     * const { count } = await prisma.requestExtension.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RequestExtensionDeleteManyArgs>(args?: SelectSubset<T, RequestExtensionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RequestExtensions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestExtensionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RequestExtensions
     * const requestExtension = await prisma.requestExtension.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RequestExtensionUpdateManyArgs>(args: SelectSubset<T, RequestExtensionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one RequestExtension.
     * @param {RequestExtensionUpsertArgs} args - Arguments to update or create a RequestExtension.
     * @example
     * // Update or create a RequestExtension
     * const requestExtension = await prisma.requestExtension.upsert({
     *   create: {
     *     // ... data to create a RequestExtension
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RequestExtension we want to update
     *   }
     * })
     */
    upsert<T extends RequestExtensionUpsertArgs>(args: SelectSubset<T, RequestExtensionUpsertArgs<ExtArgs>>): Prisma__RequestExtensionClient<$Result.GetResult<Prisma.$RequestExtensionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of RequestExtensions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestExtensionCountArgs} args - Arguments to filter RequestExtensions to count.
     * @example
     * // Count the number of RequestExtensions
     * const count = await prisma.requestExtension.count({
     *   where: {
     *     // ... the filter for the RequestExtensions we want to count
     *   }
     * })
    **/
    count<T extends RequestExtensionCountArgs>(
      args?: Subset<T, RequestExtensionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RequestExtensionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RequestExtension.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestExtensionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RequestExtensionAggregateArgs>(args: Subset<T, RequestExtensionAggregateArgs>): Prisma.PrismaPromise<GetRequestExtensionAggregateType<T>>

    /**
     * Group by RequestExtension.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestExtensionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RequestExtensionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RequestExtensionGroupByArgs['orderBy'] }
        : { orderBy?: RequestExtensionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RequestExtensionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRequestExtensionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RequestExtension model
   */
  readonly fields: RequestExtensionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RequestExtension.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RequestExtensionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    request<T extends RequestDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RequestDefaultArgs<ExtArgs>>): Prisma__RequestClient<$Result.GetResult<Prisma.$RequestPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RequestExtension model
   */ 
  interface RequestExtensionFieldRefs {
    readonly id: FieldRef<"RequestExtension", 'String'>
    readonly requestId: FieldRef<"RequestExtension", 'String'>
    readonly originalExpiresAt: FieldRef<"RequestExtension", 'DateTime'>
    readonly newExpiresAt: FieldRef<"RequestExtension", 'DateTime'>
    readonly extensionReason: FieldRef<"RequestExtension", 'String'>
    readonly extendedBy: FieldRef<"RequestExtension", 'String'>
    readonly createdAt: FieldRef<"RequestExtension", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RequestExtension findUnique
   */
  export type RequestExtensionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestExtension
     */
    select?: RequestExtensionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestExtensionInclude<ExtArgs> | null
    /**
     * Filter, which RequestExtension to fetch.
     */
    where: RequestExtensionWhereUniqueInput
  }

  /**
   * RequestExtension findUniqueOrThrow
   */
  export type RequestExtensionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestExtension
     */
    select?: RequestExtensionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestExtensionInclude<ExtArgs> | null
    /**
     * Filter, which RequestExtension to fetch.
     */
    where: RequestExtensionWhereUniqueInput
  }

  /**
   * RequestExtension findFirst
   */
  export type RequestExtensionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestExtension
     */
    select?: RequestExtensionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestExtensionInclude<ExtArgs> | null
    /**
     * Filter, which RequestExtension to fetch.
     */
    where?: RequestExtensionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestExtensions to fetch.
     */
    orderBy?: RequestExtensionOrderByWithRelationInput | RequestExtensionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RequestExtensions.
     */
    cursor?: RequestExtensionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestExtensions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestExtensions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequestExtensions.
     */
    distinct?: RequestExtensionScalarFieldEnum | RequestExtensionScalarFieldEnum[]
  }

  /**
   * RequestExtension findFirstOrThrow
   */
  export type RequestExtensionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestExtension
     */
    select?: RequestExtensionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestExtensionInclude<ExtArgs> | null
    /**
     * Filter, which RequestExtension to fetch.
     */
    where?: RequestExtensionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestExtensions to fetch.
     */
    orderBy?: RequestExtensionOrderByWithRelationInput | RequestExtensionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RequestExtensions.
     */
    cursor?: RequestExtensionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestExtensions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestExtensions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequestExtensions.
     */
    distinct?: RequestExtensionScalarFieldEnum | RequestExtensionScalarFieldEnum[]
  }

  /**
   * RequestExtension findMany
   */
  export type RequestExtensionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestExtension
     */
    select?: RequestExtensionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestExtensionInclude<ExtArgs> | null
    /**
     * Filter, which RequestExtensions to fetch.
     */
    where?: RequestExtensionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestExtensions to fetch.
     */
    orderBy?: RequestExtensionOrderByWithRelationInput | RequestExtensionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RequestExtensions.
     */
    cursor?: RequestExtensionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestExtensions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestExtensions.
     */
    skip?: number
    distinct?: RequestExtensionScalarFieldEnum | RequestExtensionScalarFieldEnum[]
  }

  /**
   * RequestExtension create
   */
  export type RequestExtensionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestExtension
     */
    select?: RequestExtensionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestExtensionInclude<ExtArgs> | null
    /**
     * The data needed to create a RequestExtension.
     */
    data: XOR<RequestExtensionCreateInput, RequestExtensionUncheckedCreateInput>
  }

  /**
   * RequestExtension createMany
   */
  export type RequestExtensionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RequestExtensions.
     */
    data: RequestExtensionCreateManyInput | RequestExtensionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RequestExtension createManyAndReturn
   */
  export type RequestExtensionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestExtension
     */
    select?: RequestExtensionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many RequestExtensions.
     */
    data: RequestExtensionCreateManyInput | RequestExtensionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestExtensionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RequestExtension update
   */
  export type RequestExtensionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestExtension
     */
    select?: RequestExtensionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestExtensionInclude<ExtArgs> | null
    /**
     * The data needed to update a RequestExtension.
     */
    data: XOR<RequestExtensionUpdateInput, RequestExtensionUncheckedUpdateInput>
    /**
     * Choose, which RequestExtension to update.
     */
    where: RequestExtensionWhereUniqueInput
  }

  /**
   * RequestExtension updateMany
   */
  export type RequestExtensionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RequestExtensions.
     */
    data: XOR<RequestExtensionUpdateManyMutationInput, RequestExtensionUncheckedUpdateManyInput>
    /**
     * Filter which RequestExtensions to update
     */
    where?: RequestExtensionWhereInput
  }

  /**
   * RequestExtension upsert
   */
  export type RequestExtensionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestExtension
     */
    select?: RequestExtensionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestExtensionInclude<ExtArgs> | null
    /**
     * The filter to search for the RequestExtension to update in case it exists.
     */
    where: RequestExtensionWhereUniqueInput
    /**
     * In case the RequestExtension found by the `where` argument doesn't exist, create a new RequestExtension with this data.
     */
    create: XOR<RequestExtensionCreateInput, RequestExtensionUncheckedCreateInput>
    /**
     * In case the RequestExtension was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RequestExtensionUpdateInput, RequestExtensionUncheckedUpdateInput>
  }

  /**
   * RequestExtension delete
   */
  export type RequestExtensionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestExtension
     */
    select?: RequestExtensionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestExtensionInclude<ExtArgs> | null
    /**
     * Filter which RequestExtension to delete.
     */
    where: RequestExtensionWhereUniqueInput
  }

  /**
   * RequestExtension deleteMany
   */
  export type RequestExtensionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RequestExtensions to delete
     */
    where?: RequestExtensionWhereInput
  }

  /**
   * RequestExtension without action
   */
  export type RequestExtensionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestExtension
     */
    select?: RequestExtensionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestExtensionInclude<ExtArgs> | null
  }


  /**
   * Model RequestSearchIndex
   */

  export type AggregateRequestSearchIndex = {
    _count: RequestSearchIndexCountAggregateOutputType | null
    _min: RequestSearchIndexMinAggregateOutputType | null
    _max: RequestSearchIndexMaxAggregateOutputType | null
  }

  export type RequestSearchIndexMinAggregateOutputType = {
    id: string | null
    requestId: string | null
    searchVector: string | null
    categoryPath: string | null
    locationText: string | null
    budgetRange: string | null
    createdAt: Date | null
  }

  export type RequestSearchIndexMaxAggregateOutputType = {
    id: string | null
    requestId: string | null
    searchVector: string | null
    categoryPath: string | null
    locationText: string | null
    budgetRange: string | null
    createdAt: Date | null
  }

  export type RequestSearchIndexCountAggregateOutputType = {
    id: number
    requestId: number
    searchVector: number
    categoryPath: number
    locationText: number
    budgetRange: number
    createdAt: number
    _all: number
  }


  export type RequestSearchIndexMinAggregateInputType = {
    id?: true
    requestId?: true
    searchVector?: true
    categoryPath?: true
    locationText?: true
    budgetRange?: true
    createdAt?: true
  }

  export type RequestSearchIndexMaxAggregateInputType = {
    id?: true
    requestId?: true
    searchVector?: true
    categoryPath?: true
    locationText?: true
    budgetRange?: true
    createdAt?: true
  }

  export type RequestSearchIndexCountAggregateInputType = {
    id?: true
    requestId?: true
    searchVector?: true
    categoryPath?: true
    locationText?: true
    budgetRange?: true
    createdAt?: true
    _all?: true
  }

  export type RequestSearchIndexAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RequestSearchIndex to aggregate.
     */
    where?: RequestSearchIndexWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestSearchIndices to fetch.
     */
    orderBy?: RequestSearchIndexOrderByWithRelationInput | RequestSearchIndexOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RequestSearchIndexWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestSearchIndices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestSearchIndices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RequestSearchIndices
    **/
    _count?: true | RequestSearchIndexCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RequestSearchIndexMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RequestSearchIndexMaxAggregateInputType
  }

  export type GetRequestSearchIndexAggregateType<T extends RequestSearchIndexAggregateArgs> = {
        [P in keyof T & keyof AggregateRequestSearchIndex]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRequestSearchIndex[P]>
      : GetScalarType<T[P], AggregateRequestSearchIndex[P]>
  }




  export type RequestSearchIndexGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RequestSearchIndexWhereInput
    orderBy?: RequestSearchIndexOrderByWithAggregationInput | RequestSearchIndexOrderByWithAggregationInput[]
    by: RequestSearchIndexScalarFieldEnum[] | RequestSearchIndexScalarFieldEnum
    having?: RequestSearchIndexScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RequestSearchIndexCountAggregateInputType | true
    _min?: RequestSearchIndexMinAggregateInputType
    _max?: RequestSearchIndexMaxAggregateInputType
  }

  export type RequestSearchIndexGroupByOutputType = {
    id: string
    requestId: string
    searchVector: string | null
    categoryPath: string | null
    locationText: string | null
    budgetRange: string | null
    createdAt: Date
    _count: RequestSearchIndexCountAggregateOutputType | null
    _min: RequestSearchIndexMinAggregateOutputType | null
    _max: RequestSearchIndexMaxAggregateOutputType | null
  }

  type GetRequestSearchIndexGroupByPayload<T extends RequestSearchIndexGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RequestSearchIndexGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RequestSearchIndexGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RequestSearchIndexGroupByOutputType[P]>
            : GetScalarType<T[P], RequestSearchIndexGroupByOutputType[P]>
        }
      >
    >


  export type RequestSearchIndexSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    requestId?: boolean
    searchVector?: boolean
    categoryPath?: boolean
    locationText?: boolean
    budgetRange?: boolean
    createdAt?: boolean
    request?: boolean | RequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["requestSearchIndex"]>

  export type RequestSearchIndexSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    requestId?: boolean
    searchVector?: boolean
    categoryPath?: boolean
    locationText?: boolean
    budgetRange?: boolean
    createdAt?: boolean
    request?: boolean | RequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["requestSearchIndex"]>

  export type RequestSearchIndexSelectScalar = {
    id?: boolean
    requestId?: boolean
    searchVector?: boolean
    categoryPath?: boolean
    locationText?: boolean
    budgetRange?: boolean
    createdAt?: boolean
  }

  export type RequestSearchIndexInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    request?: boolean | RequestDefaultArgs<ExtArgs>
  }
  export type RequestSearchIndexIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    request?: boolean | RequestDefaultArgs<ExtArgs>
  }

  export type $RequestSearchIndexPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RequestSearchIndex"
    objects: {
      request: Prisma.$RequestPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      requestId: string
      searchVector: string | null
      categoryPath: string | null
      locationText: string | null
      budgetRange: string | null
      createdAt: Date
    }, ExtArgs["result"]["requestSearchIndex"]>
    composites: {}
  }

  type RequestSearchIndexGetPayload<S extends boolean | null | undefined | RequestSearchIndexDefaultArgs> = $Result.GetResult<Prisma.$RequestSearchIndexPayload, S>

  type RequestSearchIndexCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RequestSearchIndexFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RequestSearchIndexCountAggregateInputType | true
    }

  export interface RequestSearchIndexDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RequestSearchIndex'], meta: { name: 'RequestSearchIndex' } }
    /**
     * Find zero or one RequestSearchIndex that matches the filter.
     * @param {RequestSearchIndexFindUniqueArgs} args - Arguments to find a RequestSearchIndex
     * @example
     * // Get one RequestSearchIndex
     * const requestSearchIndex = await prisma.requestSearchIndex.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RequestSearchIndexFindUniqueArgs>(args: SelectSubset<T, RequestSearchIndexFindUniqueArgs<ExtArgs>>): Prisma__RequestSearchIndexClient<$Result.GetResult<Prisma.$RequestSearchIndexPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one RequestSearchIndex that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RequestSearchIndexFindUniqueOrThrowArgs} args - Arguments to find a RequestSearchIndex
     * @example
     * // Get one RequestSearchIndex
     * const requestSearchIndex = await prisma.requestSearchIndex.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RequestSearchIndexFindUniqueOrThrowArgs>(args: SelectSubset<T, RequestSearchIndexFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RequestSearchIndexClient<$Result.GetResult<Prisma.$RequestSearchIndexPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first RequestSearchIndex that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestSearchIndexFindFirstArgs} args - Arguments to find a RequestSearchIndex
     * @example
     * // Get one RequestSearchIndex
     * const requestSearchIndex = await prisma.requestSearchIndex.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RequestSearchIndexFindFirstArgs>(args?: SelectSubset<T, RequestSearchIndexFindFirstArgs<ExtArgs>>): Prisma__RequestSearchIndexClient<$Result.GetResult<Prisma.$RequestSearchIndexPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first RequestSearchIndex that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestSearchIndexFindFirstOrThrowArgs} args - Arguments to find a RequestSearchIndex
     * @example
     * // Get one RequestSearchIndex
     * const requestSearchIndex = await prisma.requestSearchIndex.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RequestSearchIndexFindFirstOrThrowArgs>(args?: SelectSubset<T, RequestSearchIndexFindFirstOrThrowArgs<ExtArgs>>): Prisma__RequestSearchIndexClient<$Result.GetResult<Prisma.$RequestSearchIndexPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more RequestSearchIndices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestSearchIndexFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RequestSearchIndices
     * const requestSearchIndices = await prisma.requestSearchIndex.findMany()
     * 
     * // Get first 10 RequestSearchIndices
     * const requestSearchIndices = await prisma.requestSearchIndex.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const requestSearchIndexWithIdOnly = await prisma.requestSearchIndex.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RequestSearchIndexFindManyArgs>(args?: SelectSubset<T, RequestSearchIndexFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestSearchIndexPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a RequestSearchIndex.
     * @param {RequestSearchIndexCreateArgs} args - Arguments to create a RequestSearchIndex.
     * @example
     * // Create one RequestSearchIndex
     * const RequestSearchIndex = await prisma.requestSearchIndex.create({
     *   data: {
     *     // ... data to create a RequestSearchIndex
     *   }
     * })
     * 
     */
    create<T extends RequestSearchIndexCreateArgs>(args: SelectSubset<T, RequestSearchIndexCreateArgs<ExtArgs>>): Prisma__RequestSearchIndexClient<$Result.GetResult<Prisma.$RequestSearchIndexPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many RequestSearchIndices.
     * @param {RequestSearchIndexCreateManyArgs} args - Arguments to create many RequestSearchIndices.
     * @example
     * // Create many RequestSearchIndices
     * const requestSearchIndex = await prisma.requestSearchIndex.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RequestSearchIndexCreateManyArgs>(args?: SelectSubset<T, RequestSearchIndexCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RequestSearchIndices and returns the data saved in the database.
     * @param {RequestSearchIndexCreateManyAndReturnArgs} args - Arguments to create many RequestSearchIndices.
     * @example
     * // Create many RequestSearchIndices
     * const requestSearchIndex = await prisma.requestSearchIndex.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RequestSearchIndices and only return the `id`
     * const requestSearchIndexWithIdOnly = await prisma.requestSearchIndex.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RequestSearchIndexCreateManyAndReturnArgs>(args?: SelectSubset<T, RequestSearchIndexCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RequestSearchIndexPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a RequestSearchIndex.
     * @param {RequestSearchIndexDeleteArgs} args - Arguments to delete one RequestSearchIndex.
     * @example
     * // Delete one RequestSearchIndex
     * const RequestSearchIndex = await prisma.requestSearchIndex.delete({
     *   where: {
     *     // ... filter to delete one RequestSearchIndex
     *   }
     * })
     * 
     */
    delete<T extends RequestSearchIndexDeleteArgs>(args: SelectSubset<T, RequestSearchIndexDeleteArgs<ExtArgs>>): Prisma__RequestSearchIndexClient<$Result.GetResult<Prisma.$RequestSearchIndexPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one RequestSearchIndex.
     * @param {RequestSearchIndexUpdateArgs} args - Arguments to update one RequestSearchIndex.
     * @example
     * // Update one RequestSearchIndex
     * const requestSearchIndex = await prisma.requestSearchIndex.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RequestSearchIndexUpdateArgs>(args: SelectSubset<T, RequestSearchIndexUpdateArgs<ExtArgs>>): Prisma__RequestSearchIndexClient<$Result.GetResult<Prisma.$RequestSearchIndexPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more RequestSearchIndices.
     * @param {RequestSearchIndexDeleteManyArgs} args - Arguments to filter RequestSearchIndices to delete.
     * @example
     * // Delete a few RequestSearchIndices
     * const { count } = await prisma.requestSearchIndex.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RequestSearchIndexDeleteManyArgs>(args?: SelectSubset<T, RequestSearchIndexDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RequestSearchIndices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestSearchIndexUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RequestSearchIndices
     * const requestSearchIndex = await prisma.requestSearchIndex.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RequestSearchIndexUpdateManyArgs>(args: SelectSubset<T, RequestSearchIndexUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one RequestSearchIndex.
     * @param {RequestSearchIndexUpsertArgs} args - Arguments to update or create a RequestSearchIndex.
     * @example
     * // Update or create a RequestSearchIndex
     * const requestSearchIndex = await prisma.requestSearchIndex.upsert({
     *   create: {
     *     // ... data to create a RequestSearchIndex
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RequestSearchIndex we want to update
     *   }
     * })
     */
    upsert<T extends RequestSearchIndexUpsertArgs>(args: SelectSubset<T, RequestSearchIndexUpsertArgs<ExtArgs>>): Prisma__RequestSearchIndexClient<$Result.GetResult<Prisma.$RequestSearchIndexPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of RequestSearchIndices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestSearchIndexCountArgs} args - Arguments to filter RequestSearchIndices to count.
     * @example
     * // Count the number of RequestSearchIndices
     * const count = await prisma.requestSearchIndex.count({
     *   where: {
     *     // ... the filter for the RequestSearchIndices we want to count
     *   }
     * })
    **/
    count<T extends RequestSearchIndexCountArgs>(
      args?: Subset<T, RequestSearchIndexCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RequestSearchIndexCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RequestSearchIndex.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestSearchIndexAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RequestSearchIndexAggregateArgs>(args: Subset<T, RequestSearchIndexAggregateArgs>): Prisma.PrismaPromise<GetRequestSearchIndexAggregateType<T>>

    /**
     * Group by RequestSearchIndex.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RequestSearchIndexGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RequestSearchIndexGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RequestSearchIndexGroupByArgs['orderBy'] }
        : { orderBy?: RequestSearchIndexGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RequestSearchIndexGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRequestSearchIndexGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RequestSearchIndex model
   */
  readonly fields: RequestSearchIndexFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RequestSearchIndex.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RequestSearchIndexClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    request<T extends RequestDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RequestDefaultArgs<ExtArgs>>): Prisma__RequestClient<$Result.GetResult<Prisma.$RequestPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RequestSearchIndex model
   */ 
  interface RequestSearchIndexFieldRefs {
    readonly id: FieldRef<"RequestSearchIndex", 'String'>
    readonly requestId: FieldRef<"RequestSearchIndex", 'String'>
    readonly searchVector: FieldRef<"RequestSearchIndex", 'String'>
    readonly categoryPath: FieldRef<"RequestSearchIndex", 'String'>
    readonly locationText: FieldRef<"RequestSearchIndex", 'String'>
    readonly budgetRange: FieldRef<"RequestSearchIndex", 'String'>
    readonly createdAt: FieldRef<"RequestSearchIndex", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RequestSearchIndex findUnique
   */
  export type RequestSearchIndexFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestSearchIndex
     */
    select?: RequestSearchIndexSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestSearchIndexInclude<ExtArgs> | null
    /**
     * Filter, which RequestSearchIndex to fetch.
     */
    where: RequestSearchIndexWhereUniqueInput
  }

  /**
   * RequestSearchIndex findUniqueOrThrow
   */
  export type RequestSearchIndexFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestSearchIndex
     */
    select?: RequestSearchIndexSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestSearchIndexInclude<ExtArgs> | null
    /**
     * Filter, which RequestSearchIndex to fetch.
     */
    where: RequestSearchIndexWhereUniqueInput
  }

  /**
   * RequestSearchIndex findFirst
   */
  export type RequestSearchIndexFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestSearchIndex
     */
    select?: RequestSearchIndexSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestSearchIndexInclude<ExtArgs> | null
    /**
     * Filter, which RequestSearchIndex to fetch.
     */
    where?: RequestSearchIndexWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestSearchIndices to fetch.
     */
    orderBy?: RequestSearchIndexOrderByWithRelationInput | RequestSearchIndexOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RequestSearchIndices.
     */
    cursor?: RequestSearchIndexWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestSearchIndices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestSearchIndices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequestSearchIndices.
     */
    distinct?: RequestSearchIndexScalarFieldEnum | RequestSearchIndexScalarFieldEnum[]
  }

  /**
   * RequestSearchIndex findFirstOrThrow
   */
  export type RequestSearchIndexFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestSearchIndex
     */
    select?: RequestSearchIndexSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestSearchIndexInclude<ExtArgs> | null
    /**
     * Filter, which RequestSearchIndex to fetch.
     */
    where?: RequestSearchIndexWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestSearchIndices to fetch.
     */
    orderBy?: RequestSearchIndexOrderByWithRelationInput | RequestSearchIndexOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RequestSearchIndices.
     */
    cursor?: RequestSearchIndexWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestSearchIndices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestSearchIndices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RequestSearchIndices.
     */
    distinct?: RequestSearchIndexScalarFieldEnum | RequestSearchIndexScalarFieldEnum[]
  }

  /**
   * RequestSearchIndex findMany
   */
  export type RequestSearchIndexFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestSearchIndex
     */
    select?: RequestSearchIndexSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestSearchIndexInclude<ExtArgs> | null
    /**
     * Filter, which RequestSearchIndices to fetch.
     */
    where?: RequestSearchIndexWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RequestSearchIndices to fetch.
     */
    orderBy?: RequestSearchIndexOrderByWithRelationInput | RequestSearchIndexOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RequestSearchIndices.
     */
    cursor?: RequestSearchIndexWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RequestSearchIndices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RequestSearchIndices.
     */
    skip?: number
    distinct?: RequestSearchIndexScalarFieldEnum | RequestSearchIndexScalarFieldEnum[]
  }

  /**
   * RequestSearchIndex create
   */
  export type RequestSearchIndexCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestSearchIndex
     */
    select?: RequestSearchIndexSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestSearchIndexInclude<ExtArgs> | null
    /**
     * The data needed to create a RequestSearchIndex.
     */
    data: XOR<RequestSearchIndexCreateInput, RequestSearchIndexUncheckedCreateInput>
  }

  /**
   * RequestSearchIndex createMany
   */
  export type RequestSearchIndexCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RequestSearchIndices.
     */
    data: RequestSearchIndexCreateManyInput | RequestSearchIndexCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RequestSearchIndex createManyAndReturn
   */
  export type RequestSearchIndexCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestSearchIndex
     */
    select?: RequestSearchIndexSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many RequestSearchIndices.
     */
    data: RequestSearchIndexCreateManyInput | RequestSearchIndexCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestSearchIndexIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RequestSearchIndex update
   */
  export type RequestSearchIndexUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestSearchIndex
     */
    select?: RequestSearchIndexSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestSearchIndexInclude<ExtArgs> | null
    /**
     * The data needed to update a RequestSearchIndex.
     */
    data: XOR<RequestSearchIndexUpdateInput, RequestSearchIndexUncheckedUpdateInput>
    /**
     * Choose, which RequestSearchIndex to update.
     */
    where: RequestSearchIndexWhereUniqueInput
  }

  /**
   * RequestSearchIndex updateMany
   */
  export type RequestSearchIndexUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RequestSearchIndices.
     */
    data: XOR<RequestSearchIndexUpdateManyMutationInput, RequestSearchIndexUncheckedUpdateManyInput>
    /**
     * Filter which RequestSearchIndices to update
     */
    where?: RequestSearchIndexWhereInput
  }

  /**
   * RequestSearchIndex upsert
   */
  export type RequestSearchIndexUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestSearchIndex
     */
    select?: RequestSearchIndexSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestSearchIndexInclude<ExtArgs> | null
    /**
     * The filter to search for the RequestSearchIndex to update in case it exists.
     */
    where: RequestSearchIndexWhereUniqueInput
    /**
     * In case the RequestSearchIndex found by the `where` argument doesn't exist, create a new RequestSearchIndex with this data.
     */
    create: XOR<RequestSearchIndexCreateInput, RequestSearchIndexUncheckedCreateInput>
    /**
     * In case the RequestSearchIndex was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RequestSearchIndexUpdateInput, RequestSearchIndexUncheckedUpdateInput>
  }

  /**
   * RequestSearchIndex delete
   */
  export type RequestSearchIndexDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestSearchIndex
     */
    select?: RequestSearchIndexSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestSearchIndexInclude<ExtArgs> | null
    /**
     * Filter which RequestSearchIndex to delete.
     */
    where: RequestSearchIndexWhereUniqueInput
  }

  /**
   * RequestSearchIndex deleteMany
   */
  export type RequestSearchIndexDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RequestSearchIndices to delete
     */
    where?: RequestSearchIndexWhereInput
  }

  /**
   * RequestSearchIndex without action
   */
  export type RequestSearchIndexDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RequestSearchIndex
     */
    select?: RequestSearchIndexSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RequestSearchIndexInclude<ExtArgs> | null
  }


  /**
   * Model SavedSearch
   */

  export type AggregateSavedSearch = {
    _count: SavedSearchCountAggregateOutputType | null
    _min: SavedSearchMinAggregateOutputType | null
    _max: SavedSearchMaxAggregateOutputType | null
  }

  export type SavedSearchMinAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SavedSearchMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    name: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SavedSearchCountAggregateOutputType = {
    id: number
    userId: number
    name: number
    searchCriteria: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SavedSearchMinAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SavedSearchMaxAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SavedSearchCountAggregateInputType = {
    id?: true
    userId?: true
    name?: true
    searchCriteria?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SavedSearchAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SavedSearch to aggregate.
     */
    where?: SavedSearchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SavedSearches to fetch.
     */
    orderBy?: SavedSearchOrderByWithRelationInput | SavedSearchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SavedSearchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SavedSearches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SavedSearches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SavedSearches
    **/
    _count?: true | SavedSearchCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SavedSearchMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SavedSearchMaxAggregateInputType
  }

  export type GetSavedSearchAggregateType<T extends SavedSearchAggregateArgs> = {
        [P in keyof T & keyof AggregateSavedSearch]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSavedSearch[P]>
      : GetScalarType<T[P], AggregateSavedSearch[P]>
  }




  export type SavedSearchGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SavedSearchWhereInput
    orderBy?: SavedSearchOrderByWithAggregationInput | SavedSearchOrderByWithAggregationInput[]
    by: SavedSearchScalarFieldEnum[] | SavedSearchScalarFieldEnum
    having?: SavedSearchScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SavedSearchCountAggregateInputType | true
    _min?: SavedSearchMinAggregateInputType
    _max?: SavedSearchMaxAggregateInputType
  }

  export type SavedSearchGroupByOutputType = {
    id: string
    userId: string
    name: string
    searchCriteria: JsonValue
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: SavedSearchCountAggregateOutputType | null
    _min: SavedSearchMinAggregateOutputType | null
    _max: SavedSearchMaxAggregateOutputType | null
  }

  type GetSavedSearchGroupByPayload<T extends SavedSearchGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SavedSearchGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SavedSearchGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SavedSearchGroupByOutputType[P]>
            : GetScalarType<T[P], SavedSearchGroupByOutputType[P]>
        }
      >
    >


  export type SavedSearchSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    searchCriteria?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["savedSearch"]>

  export type SavedSearchSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    name?: boolean
    searchCriteria?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["savedSearch"]>

  export type SavedSearchSelectScalar = {
    id?: boolean
    userId?: boolean
    name?: boolean
    searchCriteria?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $SavedSearchPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SavedSearch"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      name: string
      searchCriteria: Prisma.JsonValue
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["savedSearch"]>
    composites: {}
  }

  type SavedSearchGetPayload<S extends boolean | null | undefined | SavedSearchDefaultArgs> = $Result.GetResult<Prisma.$SavedSearchPayload, S>

  type SavedSearchCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SavedSearchFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SavedSearchCountAggregateInputType | true
    }

  export interface SavedSearchDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SavedSearch'], meta: { name: 'SavedSearch' } }
    /**
     * Find zero or one SavedSearch that matches the filter.
     * @param {SavedSearchFindUniqueArgs} args - Arguments to find a SavedSearch
     * @example
     * // Get one SavedSearch
     * const savedSearch = await prisma.savedSearch.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SavedSearchFindUniqueArgs>(args: SelectSubset<T, SavedSearchFindUniqueArgs<ExtArgs>>): Prisma__SavedSearchClient<$Result.GetResult<Prisma.$SavedSearchPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SavedSearch that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SavedSearchFindUniqueOrThrowArgs} args - Arguments to find a SavedSearch
     * @example
     * // Get one SavedSearch
     * const savedSearch = await prisma.savedSearch.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SavedSearchFindUniqueOrThrowArgs>(args: SelectSubset<T, SavedSearchFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SavedSearchClient<$Result.GetResult<Prisma.$SavedSearchPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SavedSearch that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavedSearchFindFirstArgs} args - Arguments to find a SavedSearch
     * @example
     * // Get one SavedSearch
     * const savedSearch = await prisma.savedSearch.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SavedSearchFindFirstArgs>(args?: SelectSubset<T, SavedSearchFindFirstArgs<ExtArgs>>): Prisma__SavedSearchClient<$Result.GetResult<Prisma.$SavedSearchPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SavedSearch that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavedSearchFindFirstOrThrowArgs} args - Arguments to find a SavedSearch
     * @example
     * // Get one SavedSearch
     * const savedSearch = await prisma.savedSearch.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SavedSearchFindFirstOrThrowArgs>(args?: SelectSubset<T, SavedSearchFindFirstOrThrowArgs<ExtArgs>>): Prisma__SavedSearchClient<$Result.GetResult<Prisma.$SavedSearchPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SavedSearches that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavedSearchFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SavedSearches
     * const savedSearches = await prisma.savedSearch.findMany()
     * 
     * // Get first 10 SavedSearches
     * const savedSearches = await prisma.savedSearch.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const savedSearchWithIdOnly = await prisma.savedSearch.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SavedSearchFindManyArgs>(args?: SelectSubset<T, SavedSearchFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SavedSearchPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SavedSearch.
     * @param {SavedSearchCreateArgs} args - Arguments to create a SavedSearch.
     * @example
     * // Create one SavedSearch
     * const SavedSearch = await prisma.savedSearch.create({
     *   data: {
     *     // ... data to create a SavedSearch
     *   }
     * })
     * 
     */
    create<T extends SavedSearchCreateArgs>(args: SelectSubset<T, SavedSearchCreateArgs<ExtArgs>>): Prisma__SavedSearchClient<$Result.GetResult<Prisma.$SavedSearchPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SavedSearches.
     * @param {SavedSearchCreateManyArgs} args - Arguments to create many SavedSearches.
     * @example
     * // Create many SavedSearches
     * const savedSearch = await prisma.savedSearch.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SavedSearchCreateManyArgs>(args?: SelectSubset<T, SavedSearchCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SavedSearches and returns the data saved in the database.
     * @param {SavedSearchCreateManyAndReturnArgs} args - Arguments to create many SavedSearches.
     * @example
     * // Create many SavedSearches
     * const savedSearch = await prisma.savedSearch.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SavedSearches and only return the `id`
     * const savedSearchWithIdOnly = await prisma.savedSearch.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SavedSearchCreateManyAndReturnArgs>(args?: SelectSubset<T, SavedSearchCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SavedSearchPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SavedSearch.
     * @param {SavedSearchDeleteArgs} args - Arguments to delete one SavedSearch.
     * @example
     * // Delete one SavedSearch
     * const SavedSearch = await prisma.savedSearch.delete({
     *   where: {
     *     // ... filter to delete one SavedSearch
     *   }
     * })
     * 
     */
    delete<T extends SavedSearchDeleteArgs>(args: SelectSubset<T, SavedSearchDeleteArgs<ExtArgs>>): Prisma__SavedSearchClient<$Result.GetResult<Prisma.$SavedSearchPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SavedSearch.
     * @param {SavedSearchUpdateArgs} args - Arguments to update one SavedSearch.
     * @example
     * // Update one SavedSearch
     * const savedSearch = await prisma.savedSearch.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SavedSearchUpdateArgs>(args: SelectSubset<T, SavedSearchUpdateArgs<ExtArgs>>): Prisma__SavedSearchClient<$Result.GetResult<Prisma.$SavedSearchPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SavedSearches.
     * @param {SavedSearchDeleteManyArgs} args - Arguments to filter SavedSearches to delete.
     * @example
     * // Delete a few SavedSearches
     * const { count } = await prisma.savedSearch.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SavedSearchDeleteManyArgs>(args?: SelectSubset<T, SavedSearchDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SavedSearches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavedSearchUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SavedSearches
     * const savedSearch = await prisma.savedSearch.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SavedSearchUpdateManyArgs>(args: SelectSubset<T, SavedSearchUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SavedSearch.
     * @param {SavedSearchUpsertArgs} args - Arguments to update or create a SavedSearch.
     * @example
     * // Update or create a SavedSearch
     * const savedSearch = await prisma.savedSearch.upsert({
     *   create: {
     *     // ... data to create a SavedSearch
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SavedSearch we want to update
     *   }
     * })
     */
    upsert<T extends SavedSearchUpsertArgs>(args: SelectSubset<T, SavedSearchUpsertArgs<ExtArgs>>): Prisma__SavedSearchClient<$Result.GetResult<Prisma.$SavedSearchPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SavedSearches.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavedSearchCountArgs} args - Arguments to filter SavedSearches to count.
     * @example
     * // Count the number of SavedSearches
     * const count = await prisma.savedSearch.count({
     *   where: {
     *     // ... the filter for the SavedSearches we want to count
     *   }
     * })
    **/
    count<T extends SavedSearchCountArgs>(
      args?: Subset<T, SavedSearchCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SavedSearchCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SavedSearch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavedSearchAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SavedSearchAggregateArgs>(args: Subset<T, SavedSearchAggregateArgs>): Prisma.PrismaPromise<GetSavedSearchAggregateType<T>>

    /**
     * Group by SavedSearch.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SavedSearchGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SavedSearchGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SavedSearchGroupByArgs['orderBy'] }
        : { orderBy?: SavedSearchGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SavedSearchGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSavedSearchGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SavedSearch model
   */
  readonly fields: SavedSearchFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SavedSearch.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SavedSearchClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SavedSearch model
   */ 
  interface SavedSearchFieldRefs {
    readonly id: FieldRef<"SavedSearch", 'String'>
    readonly userId: FieldRef<"SavedSearch", 'String'>
    readonly name: FieldRef<"SavedSearch", 'String'>
    readonly searchCriteria: FieldRef<"SavedSearch", 'Json'>
    readonly isActive: FieldRef<"SavedSearch", 'Boolean'>
    readonly createdAt: FieldRef<"SavedSearch", 'DateTime'>
    readonly updatedAt: FieldRef<"SavedSearch", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SavedSearch findUnique
   */
  export type SavedSearchFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedSearch
     */
    select?: SavedSearchSelect<ExtArgs> | null
    /**
     * Filter, which SavedSearch to fetch.
     */
    where: SavedSearchWhereUniqueInput
  }

  /**
   * SavedSearch findUniqueOrThrow
   */
  export type SavedSearchFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedSearch
     */
    select?: SavedSearchSelect<ExtArgs> | null
    /**
     * Filter, which SavedSearch to fetch.
     */
    where: SavedSearchWhereUniqueInput
  }

  /**
   * SavedSearch findFirst
   */
  export type SavedSearchFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedSearch
     */
    select?: SavedSearchSelect<ExtArgs> | null
    /**
     * Filter, which SavedSearch to fetch.
     */
    where?: SavedSearchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SavedSearches to fetch.
     */
    orderBy?: SavedSearchOrderByWithRelationInput | SavedSearchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SavedSearches.
     */
    cursor?: SavedSearchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SavedSearches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SavedSearches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SavedSearches.
     */
    distinct?: SavedSearchScalarFieldEnum | SavedSearchScalarFieldEnum[]
  }

  /**
   * SavedSearch findFirstOrThrow
   */
  export type SavedSearchFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedSearch
     */
    select?: SavedSearchSelect<ExtArgs> | null
    /**
     * Filter, which SavedSearch to fetch.
     */
    where?: SavedSearchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SavedSearches to fetch.
     */
    orderBy?: SavedSearchOrderByWithRelationInput | SavedSearchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SavedSearches.
     */
    cursor?: SavedSearchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SavedSearches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SavedSearches.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SavedSearches.
     */
    distinct?: SavedSearchScalarFieldEnum | SavedSearchScalarFieldEnum[]
  }

  /**
   * SavedSearch findMany
   */
  export type SavedSearchFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedSearch
     */
    select?: SavedSearchSelect<ExtArgs> | null
    /**
     * Filter, which SavedSearches to fetch.
     */
    where?: SavedSearchWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SavedSearches to fetch.
     */
    orderBy?: SavedSearchOrderByWithRelationInput | SavedSearchOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SavedSearches.
     */
    cursor?: SavedSearchWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SavedSearches from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SavedSearches.
     */
    skip?: number
    distinct?: SavedSearchScalarFieldEnum | SavedSearchScalarFieldEnum[]
  }

  /**
   * SavedSearch create
   */
  export type SavedSearchCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedSearch
     */
    select?: SavedSearchSelect<ExtArgs> | null
    /**
     * The data needed to create a SavedSearch.
     */
    data: XOR<SavedSearchCreateInput, SavedSearchUncheckedCreateInput>
  }

  /**
   * SavedSearch createMany
   */
  export type SavedSearchCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SavedSearches.
     */
    data: SavedSearchCreateManyInput | SavedSearchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SavedSearch createManyAndReturn
   */
  export type SavedSearchCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedSearch
     */
    select?: SavedSearchSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SavedSearches.
     */
    data: SavedSearchCreateManyInput | SavedSearchCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SavedSearch update
   */
  export type SavedSearchUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedSearch
     */
    select?: SavedSearchSelect<ExtArgs> | null
    /**
     * The data needed to update a SavedSearch.
     */
    data: XOR<SavedSearchUpdateInput, SavedSearchUncheckedUpdateInput>
    /**
     * Choose, which SavedSearch to update.
     */
    where: SavedSearchWhereUniqueInput
  }

  /**
   * SavedSearch updateMany
   */
  export type SavedSearchUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SavedSearches.
     */
    data: XOR<SavedSearchUpdateManyMutationInput, SavedSearchUncheckedUpdateManyInput>
    /**
     * Filter which SavedSearches to update
     */
    where?: SavedSearchWhereInput
  }

  /**
   * SavedSearch upsert
   */
  export type SavedSearchUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedSearch
     */
    select?: SavedSearchSelect<ExtArgs> | null
    /**
     * The filter to search for the SavedSearch to update in case it exists.
     */
    where: SavedSearchWhereUniqueInput
    /**
     * In case the SavedSearch found by the `where` argument doesn't exist, create a new SavedSearch with this data.
     */
    create: XOR<SavedSearchCreateInput, SavedSearchUncheckedCreateInput>
    /**
     * In case the SavedSearch was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SavedSearchUpdateInput, SavedSearchUncheckedUpdateInput>
  }

  /**
   * SavedSearch delete
   */
  export type SavedSearchDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedSearch
     */
    select?: SavedSearchSelect<ExtArgs> | null
    /**
     * Filter which SavedSearch to delete.
     */
    where: SavedSearchWhereUniqueInput
  }

  /**
   * SavedSearch deleteMany
   */
  export type SavedSearchDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SavedSearches to delete
     */
    where?: SavedSearchWhereInput
  }

  /**
   * SavedSearch without action
   */
  export type SavedSearchDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SavedSearch
     */
    select?: SavedSearchSelect<ExtArgs> | null
  }


  /**
   * Model Bid
   */

  export type AggregateBid = {
    _count: BidCountAggregateOutputType | null
    _avg: BidAvgAggregateOutputType | null
    _sum: BidSumAggregateOutputType | null
    _min: BidMinAggregateOutputType | null
    _max: BidMaxAggregateOutputType | null
  }

  export type BidAvgAggregateOutputType = {
    amount: Decimal | null
    deliveryDays: number | null
    priorityScore: number | null
    bidFee: Decimal | null
  }

  export type BidSumAggregateOutputType = {
    amount: Decimal | null
    deliveryDays: number | null
    priorityScore: number | null
    bidFee: Decimal | null
  }

  export type BidMinAggregateOutputType = {
    id: string | null
    requestId: string | null
    merchantId: string | null
    amount: Decimal | null
    deliveryDays: number | null
    deliveryNotes: string | null
    specialTerms: string | null
    status: $Enums.BidStatus | null
    priorityScore: number | null
    isTemplate: boolean | null
    templateName: string | null
    bidFee: Decimal | null
    feePaid: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    expiresAt: Date | null
    acceptedAt: Date | null
    rejectedAt: Date | null
    withdrawnAt: Date | null
  }

  export type BidMaxAggregateOutputType = {
    id: string | null
    requestId: string | null
    merchantId: string | null
    amount: Decimal | null
    deliveryDays: number | null
    deliveryNotes: string | null
    specialTerms: string | null
    status: $Enums.BidStatus | null
    priorityScore: number | null
    isTemplate: boolean | null
    templateName: string | null
    bidFee: Decimal | null
    feePaid: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
    expiresAt: Date | null
    acceptedAt: Date | null
    rejectedAt: Date | null
    withdrawnAt: Date | null
  }

  export type BidCountAggregateOutputType = {
    id: number
    requestId: number
    merchantId: number
    amount: number
    deliveryDays: number
    deliveryNotes: number
    specialTerms: number
    status: number
    priorityScore: number
    isTemplate: number
    templateName: number
    bidFee: number
    feePaid: number
    createdAt: number
    updatedAt: number
    expiresAt: number
    acceptedAt: number
    rejectedAt: number
    withdrawnAt: number
    _all: number
  }


  export type BidAvgAggregateInputType = {
    amount?: true
    deliveryDays?: true
    priorityScore?: true
    bidFee?: true
  }

  export type BidSumAggregateInputType = {
    amount?: true
    deliveryDays?: true
    priorityScore?: true
    bidFee?: true
  }

  export type BidMinAggregateInputType = {
    id?: true
    requestId?: true
    merchantId?: true
    amount?: true
    deliveryDays?: true
    deliveryNotes?: true
    specialTerms?: true
    status?: true
    priorityScore?: true
    isTemplate?: true
    templateName?: true
    bidFee?: true
    feePaid?: true
    createdAt?: true
    updatedAt?: true
    expiresAt?: true
    acceptedAt?: true
    rejectedAt?: true
    withdrawnAt?: true
  }

  export type BidMaxAggregateInputType = {
    id?: true
    requestId?: true
    merchantId?: true
    amount?: true
    deliveryDays?: true
    deliveryNotes?: true
    specialTerms?: true
    status?: true
    priorityScore?: true
    isTemplate?: true
    templateName?: true
    bidFee?: true
    feePaid?: true
    createdAt?: true
    updatedAt?: true
    expiresAt?: true
    acceptedAt?: true
    rejectedAt?: true
    withdrawnAt?: true
  }

  export type BidCountAggregateInputType = {
    id?: true
    requestId?: true
    merchantId?: true
    amount?: true
    deliveryDays?: true
    deliveryNotes?: true
    specialTerms?: true
    status?: true
    priorityScore?: true
    isTemplate?: true
    templateName?: true
    bidFee?: true
    feePaid?: true
    createdAt?: true
    updatedAt?: true
    expiresAt?: true
    acceptedAt?: true
    rejectedAt?: true
    withdrawnAt?: true
    _all?: true
  }

  export type BidAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bid to aggregate.
     */
    where?: BidWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bids to fetch.
     */
    orderBy?: BidOrderByWithRelationInput | BidOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BidWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bids from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bids.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Bids
    **/
    _count?: true | BidCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BidAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BidSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BidMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BidMaxAggregateInputType
  }

  export type GetBidAggregateType<T extends BidAggregateArgs> = {
        [P in keyof T & keyof AggregateBid]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBid[P]>
      : GetScalarType<T[P], AggregateBid[P]>
  }




  export type BidGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BidWhereInput
    orderBy?: BidOrderByWithAggregationInput | BidOrderByWithAggregationInput[]
    by: BidScalarFieldEnum[] | BidScalarFieldEnum
    having?: BidScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BidCountAggregateInputType | true
    _avg?: BidAvgAggregateInputType
    _sum?: BidSumAggregateInputType
    _min?: BidMinAggregateInputType
    _max?: BidMaxAggregateInputType
  }

  export type BidGroupByOutputType = {
    id: string
    requestId: string
    merchantId: string
    amount: Decimal
    deliveryDays: number
    deliveryNotes: string | null
    specialTerms: string | null
    status: $Enums.BidStatus
    priorityScore: number
    isTemplate: boolean
    templateName: string | null
    bidFee: Decimal
    feePaid: boolean
    createdAt: Date
    updatedAt: Date
    expiresAt: Date | null
    acceptedAt: Date | null
    rejectedAt: Date | null
    withdrawnAt: Date | null
    _count: BidCountAggregateOutputType | null
    _avg: BidAvgAggregateOutputType | null
    _sum: BidSumAggregateOutputType | null
    _min: BidMinAggregateOutputType | null
    _max: BidMaxAggregateOutputType | null
  }

  type GetBidGroupByPayload<T extends BidGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BidGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BidGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BidGroupByOutputType[P]>
            : GetScalarType<T[P], BidGroupByOutputType[P]>
        }
      >
    >


  export type BidSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    requestId?: boolean
    merchantId?: boolean
    amount?: boolean
    deliveryDays?: boolean
    deliveryNotes?: boolean
    specialTerms?: boolean
    status?: boolean
    priorityScore?: boolean
    isTemplate?: boolean
    templateName?: boolean
    bidFee?: boolean
    feePaid?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    expiresAt?: boolean
    acceptedAt?: boolean
    rejectedAt?: boolean
    withdrawnAt?: boolean
  }, ExtArgs["result"]["bid"]>

  export type BidSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    requestId?: boolean
    merchantId?: boolean
    amount?: boolean
    deliveryDays?: boolean
    deliveryNotes?: boolean
    specialTerms?: boolean
    status?: boolean
    priorityScore?: boolean
    isTemplate?: boolean
    templateName?: boolean
    bidFee?: boolean
    feePaid?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    expiresAt?: boolean
    acceptedAt?: boolean
    rejectedAt?: boolean
    withdrawnAt?: boolean
  }, ExtArgs["result"]["bid"]>

  export type BidSelectScalar = {
    id?: boolean
    requestId?: boolean
    merchantId?: boolean
    amount?: boolean
    deliveryDays?: boolean
    deliveryNotes?: boolean
    specialTerms?: boolean
    status?: boolean
    priorityScore?: boolean
    isTemplate?: boolean
    templateName?: boolean
    bidFee?: boolean
    feePaid?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    expiresAt?: boolean
    acceptedAt?: boolean
    rejectedAt?: boolean
    withdrawnAt?: boolean
  }


  export type $BidPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Bid"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      requestId: string
      merchantId: string
      amount: Prisma.Decimal
      deliveryDays: number
      deliveryNotes: string | null
      specialTerms: string | null
      status: $Enums.BidStatus
      priorityScore: number
      isTemplate: boolean
      templateName: string | null
      bidFee: Prisma.Decimal
      feePaid: boolean
      createdAt: Date
      updatedAt: Date
      expiresAt: Date | null
      acceptedAt: Date | null
      rejectedAt: Date | null
      withdrawnAt: Date | null
    }, ExtArgs["result"]["bid"]>
    composites: {}
  }

  type BidGetPayload<S extends boolean | null | undefined | BidDefaultArgs> = $Result.GetResult<Prisma.$BidPayload, S>

  type BidCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<BidFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: BidCountAggregateInputType | true
    }

  export interface BidDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Bid'], meta: { name: 'Bid' } }
    /**
     * Find zero or one Bid that matches the filter.
     * @param {BidFindUniqueArgs} args - Arguments to find a Bid
     * @example
     * // Get one Bid
     * const bid = await prisma.bid.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BidFindUniqueArgs>(args: SelectSubset<T, BidFindUniqueArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Bid that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {BidFindUniqueOrThrowArgs} args - Arguments to find a Bid
     * @example
     * // Get one Bid
     * const bid = await prisma.bid.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BidFindUniqueOrThrowArgs>(args: SelectSubset<T, BidFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Bid that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidFindFirstArgs} args - Arguments to find a Bid
     * @example
     * // Get one Bid
     * const bid = await prisma.bid.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BidFindFirstArgs>(args?: SelectSubset<T, BidFindFirstArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Bid that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidFindFirstOrThrowArgs} args - Arguments to find a Bid
     * @example
     * // Get one Bid
     * const bid = await prisma.bid.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BidFindFirstOrThrowArgs>(args?: SelectSubset<T, BidFindFirstOrThrowArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Bids that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Bids
     * const bids = await prisma.bid.findMany()
     * 
     * // Get first 10 Bids
     * const bids = await prisma.bid.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bidWithIdOnly = await prisma.bid.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BidFindManyArgs>(args?: SelectSubset<T, BidFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Bid.
     * @param {BidCreateArgs} args - Arguments to create a Bid.
     * @example
     * // Create one Bid
     * const Bid = await prisma.bid.create({
     *   data: {
     *     // ... data to create a Bid
     *   }
     * })
     * 
     */
    create<T extends BidCreateArgs>(args: SelectSubset<T, BidCreateArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Bids.
     * @param {BidCreateManyArgs} args - Arguments to create many Bids.
     * @example
     * // Create many Bids
     * const bid = await prisma.bid.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BidCreateManyArgs>(args?: SelectSubset<T, BidCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Bids and returns the data saved in the database.
     * @param {BidCreateManyAndReturnArgs} args - Arguments to create many Bids.
     * @example
     * // Create many Bids
     * const bid = await prisma.bid.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Bids and only return the `id`
     * const bidWithIdOnly = await prisma.bid.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BidCreateManyAndReturnArgs>(args?: SelectSubset<T, BidCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Bid.
     * @param {BidDeleteArgs} args - Arguments to delete one Bid.
     * @example
     * // Delete one Bid
     * const Bid = await prisma.bid.delete({
     *   where: {
     *     // ... filter to delete one Bid
     *   }
     * })
     * 
     */
    delete<T extends BidDeleteArgs>(args: SelectSubset<T, BidDeleteArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Bid.
     * @param {BidUpdateArgs} args - Arguments to update one Bid.
     * @example
     * // Update one Bid
     * const bid = await prisma.bid.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BidUpdateArgs>(args: SelectSubset<T, BidUpdateArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Bids.
     * @param {BidDeleteManyArgs} args - Arguments to filter Bids to delete.
     * @example
     * // Delete a few Bids
     * const { count } = await prisma.bid.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BidDeleteManyArgs>(args?: SelectSubset<T, BidDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Bids.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Bids
     * const bid = await prisma.bid.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BidUpdateManyArgs>(args: SelectSubset<T, BidUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Bid.
     * @param {BidUpsertArgs} args - Arguments to update or create a Bid.
     * @example
     * // Update or create a Bid
     * const bid = await prisma.bid.upsert({
     *   create: {
     *     // ... data to create a Bid
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Bid we want to update
     *   }
     * })
     */
    upsert<T extends BidUpsertArgs>(args: SelectSubset<T, BidUpsertArgs<ExtArgs>>): Prisma__BidClient<$Result.GetResult<Prisma.$BidPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Bids.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidCountArgs} args - Arguments to filter Bids to count.
     * @example
     * // Count the number of Bids
     * const count = await prisma.bid.count({
     *   where: {
     *     // ... the filter for the Bids we want to count
     *   }
     * })
    **/
    count<T extends BidCountArgs>(
      args?: Subset<T, BidCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BidCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Bid.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BidAggregateArgs>(args: Subset<T, BidAggregateArgs>): Prisma.PrismaPromise<GetBidAggregateType<T>>

    /**
     * Group by Bid.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BidGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BidGroupByArgs['orderBy'] }
        : { orderBy?: BidGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BidGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBidGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Bid model
   */
  readonly fields: BidFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Bid.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BidClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Bid model
   */ 
  interface BidFieldRefs {
    readonly id: FieldRef<"Bid", 'String'>
    readonly requestId: FieldRef<"Bid", 'String'>
    readonly merchantId: FieldRef<"Bid", 'String'>
    readonly amount: FieldRef<"Bid", 'Decimal'>
    readonly deliveryDays: FieldRef<"Bid", 'Int'>
    readonly deliveryNotes: FieldRef<"Bid", 'String'>
    readonly specialTerms: FieldRef<"Bid", 'String'>
    readonly status: FieldRef<"Bid", 'BidStatus'>
    readonly priorityScore: FieldRef<"Bid", 'Int'>
    readonly isTemplate: FieldRef<"Bid", 'Boolean'>
    readonly templateName: FieldRef<"Bid", 'String'>
    readonly bidFee: FieldRef<"Bid", 'Decimal'>
    readonly feePaid: FieldRef<"Bid", 'Boolean'>
    readonly createdAt: FieldRef<"Bid", 'DateTime'>
    readonly updatedAt: FieldRef<"Bid", 'DateTime'>
    readonly expiresAt: FieldRef<"Bid", 'DateTime'>
    readonly acceptedAt: FieldRef<"Bid", 'DateTime'>
    readonly rejectedAt: FieldRef<"Bid", 'DateTime'>
    readonly withdrawnAt: FieldRef<"Bid", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Bid findUnique
   */
  export type BidFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Filter, which Bid to fetch.
     */
    where: BidWhereUniqueInput
  }

  /**
   * Bid findUniqueOrThrow
   */
  export type BidFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Filter, which Bid to fetch.
     */
    where: BidWhereUniqueInput
  }

  /**
   * Bid findFirst
   */
  export type BidFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Filter, which Bid to fetch.
     */
    where?: BidWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bids to fetch.
     */
    orderBy?: BidOrderByWithRelationInput | BidOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bids.
     */
    cursor?: BidWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bids from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bids.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bids.
     */
    distinct?: BidScalarFieldEnum | BidScalarFieldEnum[]
  }

  /**
   * Bid findFirstOrThrow
   */
  export type BidFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Filter, which Bid to fetch.
     */
    where?: BidWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bids to fetch.
     */
    orderBy?: BidOrderByWithRelationInput | BidOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Bids.
     */
    cursor?: BidWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bids from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bids.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Bids.
     */
    distinct?: BidScalarFieldEnum | BidScalarFieldEnum[]
  }

  /**
   * Bid findMany
   */
  export type BidFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Filter, which Bids to fetch.
     */
    where?: BidWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Bids to fetch.
     */
    orderBy?: BidOrderByWithRelationInput | BidOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Bids.
     */
    cursor?: BidWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Bids from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Bids.
     */
    skip?: number
    distinct?: BidScalarFieldEnum | BidScalarFieldEnum[]
  }

  /**
   * Bid create
   */
  export type BidCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * The data needed to create a Bid.
     */
    data: XOR<BidCreateInput, BidUncheckedCreateInput>
  }

  /**
   * Bid createMany
   */
  export type BidCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Bids.
     */
    data: BidCreateManyInput | BidCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Bid createManyAndReturn
   */
  export type BidCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Bids.
     */
    data: BidCreateManyInput | BidCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Bid update
   */
  export type BidUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * The data needed to update a Bid.
     */
    data: XOR<BidUpdateInput, BidUncheckedUpdateInput>
    /**
     * Choose, which Bid to update.
     */
    where: BidWhereUniqueInput
  }

  /**
   * Bid updateMany
   */
  export type BidUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Bids.
     */
    data: XOR<BidUpdateManyMutationInput, BidUncheckedUpdateManyInput>
    /**
     * Filter which Bids to update
     */
    where?: BidWhereInput
  }

  /**
   * Bid upsert
   */
  export type BidUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * The filter to search for the Bid to update in case it exists.
     */
    where: BidWhereUniqueInput
    /**
     * In case the Bid found by the `where` argument doesn't exist, create a new Bid with this data.
     */
    create: XOR<BidCreateInput, BidUncheckedCreateInput>
    /**
     * In case the Bid was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BidUpdateInput, BidUncheckedUpdateInput>
  }

  /**
   * Bid delete
   */
  export type BidDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
    /**
     * Filter which Bid to delete.
     */
    where: BidWhereUniqueInput
  }

  /**
   * Bid deleteMany
   */
  export type BidDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bids to delete
     */
    where?: BidWhereInput
  }

  /**
   * Bid without action
   */
  export type BidDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bid
     */
    select?: BidSelect<ExtArgs> | null
  }


  /**
   * Model BidTemplate
   */

  export type AggregateBidTemplate = {
    _count: BidTemplateCountAggregateOutputType | null
    _avg: BidTemplateAvgAggregateOutputType | null
    _sum: BidTemplateSumAggregateOutputType | null
    _min: BidTemplateMinAggregateOutputType | null
    _max: BidTemplateMaxAggregateOutputType | null
  }

  export type BidTemplateAvgAggregateOutputType = {
    amountPercentage: Decimal | null
    fixedAmount: Decimal | null
    deliveryDays: number | null
    usageCount: number | null
    successCount: number | null
  }

  export type BidTemplateSumAggregateOutputType = {
    amountPercentage: Decimal | null
    fixedAmount: Decimal | null
    deliveryDays: number | null
    usageCount: number | null
    successCount: number | null
  }

  export type BidTemplateMinAggregateOutputType = {
    id: string | null
    merchantId: string | null
    name: string | null
    description: string | null
    amountType: $Enums.AmountType | null
    amountPercentage: Decimal | null
    fixedAmount: Decimal | null
    deliveryDays: number | null
    deliveryNotes: string | null
    specialTerms: string | null
    isActive: boolean | null
    usageCount: number | null
    successCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BidTemplateMaxAggregateOutputType = {
    id: string | null
    merchantId: string | null
    name: string | null
    description: string | null
    amountType: $Enums.AmountType | null
    amountPercentage: Decimal | null
    fixedAmount: Decimal | null
    deliveryDays: number | null
    deliveryNotes: string | null
    specialTerms: string | null
    isActive: boolean | null
    usageCount: number | null
    successCount: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type BidTemplateCountAggregateOutputType = {
    id: number
    merchantId: number
    name: number
    description: number
    amountType: number
    amountPercentage: number
    fixedAmount: number
    deliveryDays: number
    deliveryNotes: number
    specialTerms: number
    isActive: number
    usageCount: number
    successCount: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type BidTemplateAvgAggregateInputType = {
    amountPercentage?: true
    fixedAmount?: true
    deliveryDays?: true
    usageCount?: true
    successCount?: true
  }

  export type BidTemplateSumAggregateInputType = {
    amountPercentage?: true
    fixedAmount?: true
    deliveryDays?: true
    usageCount?: true
    successCount?: true
  }

  export type BidTemplateMinAggregateInputType = {
    id?: true
    merchantId?: true
    name?: true
    description?: true
    amountType?: true
    amountPercentage?: true
    fixedAmount?: true
    deliveryDays?: true
    deliveryNotes?: true
    specialTerms?: true
    isActive?: true
    usageCount?: true
    successCount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BidTemplateMaxAggregateInputType = {
    id?: true
    merchantId?: true
    name?: true
    description?: true
    amountType?: true
    amountPercentage?: true
    fixedAmount?: true
    deliveryDays?: true
    deliveryNotes?: true
    specialTerms?: true
    isActive?: true
    usageCount?: true
    successCount?: true
    createdAt?: true
    updatedAt?: true
  }

  export type BidTemplateCountAggregateInputType = {
    id?: true
    merchantId?: true
    name?: true
    description?: true
    amountType?: true
    amountPercentage?: true
    fixedAmount?: true
    deliveryDays?: true
    deliveryNotes?: true
    specialTerms?: true
    isActive?: true
    usageCount?: true
    successCount?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type BidTemplateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BidTemplate to aggregate.
     */
    where?: BidTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BidTemplates to fetch.
     */
    orderBy?: BidTemplateOrderByWithRelationInput | BidTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BidTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BidTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BidTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BidTemplates
    **/
    _count?: true | BidTemplateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BidTemplateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BidTemplateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BidTemplateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BidTemplateMaxAggregateInputType
  }

  export type GetBidTemplateAggregateType<T extends BidTemplateAggregateArgs> = {
        [P in keyof T & keyof AggregateBidTemplate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBidTemplate[P]>
      : GetScalarType<T[P], AggregateBidTemplate[P]>
  }




  export type BidTemplateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BidTemplateWhereInput
    orderBy?: BidTemplateOrderByWithAggregationInput | BidTemplateOrderByWithAggregationInput[]
    by: BidTemplateScalarFieldEnum[] | BidTemplateScalarFieldEnum
    having?: BidTemplateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BidTemplateCountAggregateInputType | true
    _avg?: BidTemplateAvgAggregateInputType
    _sum?: BidTemplateSumAggregateInputType
    _min?: BidTemplateMinAggregateInputType
    _max?: BidTemplateMaxAggregateInputType
  }

  export type BidTemplateGroupByOutputType = {
    id: string
    merchantId: string
    name: string
    description: string | null
    amountType: $Enums.AmountType
    amountPercentage: Decimal | null
    fixedAmount: Decimal | null
    deliveryDays: number | null
    deliveryNotes: string | null
    specialTerms: string | null
    isActive: boolean
    usageCount: number
    successCount: number
    createdAt: Date
    updatedAt: Date
    _count: BidTemplateCountAggregateOutputType | null
    _avg: BidTemplateAvgAggregateOutputType | null
    _sum: BidTemplateSumAggregateOutputType | null
    _min: BidTemplateMinAggregateOutputType | null
    _max: BidTemplateMaxAggregateOutputType | null
  }

  type GetBidTemplateGroupByPayload<T extends BidTemplateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BidTemplateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BidTemplateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BidTemplateGroupByOutputType[P]>
            : GetScalarType<T[P], BidTemplateGroupByOutputType[P]>
        }
      >
    >


  export type BidTemplateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    merchantId?: boolean
    name?: boolean
    description?: boolean
    amountType?: boolean
    amountPercentage?: boolean
    fixedAmount?: boolean
    deliveryDays?: boolean
    deliveryNotes?: boolean
    specialTerms?: boolean
    isActive?: boolean
    usageCount?: boolean
    successCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["bidTemplate"]>

  export type BidTemplateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    merchantId?: boolean
    name?: boolean
    description?: boolean
    amountType?: boolean
    amountPercentage?: boolean
    fixedAmount?: boolean
    deliveryDays?: boolean
    deliveryNotes?: boolean
    specialTerms?: boolean
    isActive?: boolean
    usageCount?: boolean
    successCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["bidTemplate"]>

  export type BidTemplateSelectScalar = {
    id?: boolean
    merchantId?: boolean
    name?: boolean
    description?: boolean
    amountType?: boolean
    amountPercentage?: boolean
    fixedAmount?: boolean
    deliveryDays?: boolean
    deliveryNotes?: boolean
    specialTerms?: boolean
    isActive?: boolean
    usageCount?: boolean
    successCount?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $BidTemplatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BidTemplate"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      merchantId: string
      name: string
      description: string | null
      amountType: $Enums.AmountType
      amountPercentage: Prisma.Decimal | null
      fixedAmount: Prisma.Decimal | null
      deliveryDays: number | null
      deliveryNotes: string | null
      specialTerms: string | null
      isActive: boolean
      usageCount: number
      successCount: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["bidTemplate"]>
    composites: {}
  }

  type BidTemplateGetPayload<S extends boolean | null | undefined | BidTemplateDefaultArgs> = $Result.GetResult<Prisma.$BidTemplatePayload, S>

  type BidTemplateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<BidTemplateFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: BidTemplateCountAggregateInputType | true
    }

  export interface BidTemplateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BidTemplate'], meta: { name: 'BidTemplate' } }
    /**
     * Find zero or one BidTemplate that matches the filter.
     * @param {BidTemplateFindUniqueArgs} args - Arguments to find a BidTemplate
     * @example
     * // Get one BidTemplate
     * const bidTemplate = await prisma.bidTemplate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BidTemplateFindUniqueArgs>(args: SelectSubset<T, BidTemplateFindUniqueArgs<ExtArgs>>): Prisma__BidTemplateClient<$Result.GetResult<Prisma.$BidTemplatePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one BidTemplate that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {BidTemplateFindUniqueOrThrowArgs} args - Arguments to find a BidTemplate
     * @example
     * // Get one BidTemplate
     * const bidTemplate = await prisma.bidTemplate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BidTemplateFindUniqueOrThrowArgs>(args: SelectSubset<T, BidTemplateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BidTemplateClient<$Result.GetResult<Prisma.$BidTemplatePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first BidTemplate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidTemplateFindFirstArgs} args - Arguments to find a BidTemplate
     * @example
     * // Get one BidTemplate
     * const bidTemplate = await prisma.bidTemplate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BidTemplateFindFirstArgs>(args?: SelectSubset<T, BidTemplateFindFirstArgs<ExtArgs>>): Prisma__BidTemplateClient<$Result.GetResult<Prisma.$BidTemplatePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first BidTemplate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidTemplateFindFirstOrThrowArgs} args - Arguments to find a BidTemplate
     * @example
     * // Get one BidTemplate
     * const bidTemplate = await prisma.bidTemplate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BidTemplateFindFirstOrThrowArgs>(args?: SelectSubset<T, BidTemplateFindFirstOrThrowArgs<ExtArgs>>): Prisma__BidTemplateClient<$Result.GetResult<Prisma.$BidTemplatePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more BidTemplates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidTemplateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BidTemplates
     * const bidTemplates = await prisma.bidTemplate.findMany()
     * 
     * // Get first 10 BidTemplates
     * const bidTemplates = await prisma.bidTemplate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const bidTemplateWithIdOnly = await prisma.bidTemplate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BidTemplateFindManyArgs>(args?: SelectSubset<T, BidTemplateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BidTemplatePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a BidTemplate.
     * @param {BidTemplateCreateArgs} args - Arguments to create a BidTemplate.
     * @example
     * // Create one BidTemplate
     * const BidTemplate = await prisma.bidTemplate.create({
     *   data: {
     *     // ... data to create a BidTemplate
     *   }
     * })
     * 
     */
    create<T extends BidTemplateCreateArgs>(args: SelectSubset<T, BidTemplateCreateArgs<ExtArgs>>): Prisma__BidTemplateClient<$Result.GetResult<Prisma.$BidTemplatePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many BidTemplates.
     * @param {BidTemplateCreateManyArgs} args - Arguments to create many BidTemplates.
     * @example
     * // Create many BidTemplates
     * const bidTemplate = await prisma.bidTemplate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BidTemplateCreateManyArgs>(args?: SelectSubset<T, BidTemplateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BidTemplates and returns the data saved in the database.
     * @param {BidTemplateCreateManyAndReturnArgs} args - Arguments to create many BidTemplates.
     * @example
     * // Create many BidTemplates
     * const bidTemplate = await prisma.bidTemplate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BidTemplates and only return the `id`
     * const bidTemplateWithIdOnly = await prisma.bidTemplate.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BidTemplateCreateManyAndReturnArgs>(args?: SelectSubset<T, BidTemplateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BidTemplatePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a BidTemplate.
     * @param {BidTemplateDeleteArgs} args - Arguments to delete one BidTemplate.
     * @example
     * // Delete one BidTemplate
     * const BidTemplate = await prisma.bidTemplate.delete({
     *   where: {
     *     // ... filter to delete one BidTemplate
     *   }
     * })
     * 
     */
    delete<T extends BidTemplateDeleteArgs>(args: SelectSubset<T, BidTemplateDeleteArgs<ExtArgs>>): Prisma__BidTemplateClient<$Result.GetResult<Prisma.$BidTemplatePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one BidTemplate.
     * @param {BidTemplateUpdateArgs} args - Arguments to update one BidTemplate.
     * @example
     * // Update one BidTemplate
     * const bidTemplate = await prisma.bidTemplate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BidTemplateUpdateArgs>(args: SelectSubset<T, BidTemplateUpdateArgs<ExtArgs>>): Prisma__BidTemplateClient<$Result.GetResult<Prisma.$BidTemplatePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more BidTemplates.
     * @param {BidTemplateDeleteManyArgs} args - Arguments to filter BidTemplates to delete.
     * @example
     * // Delete a few BidTemplates
     * const { count } = await prisma.bidTemplate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BidTemplateDeleteManyArgs>(args?: SelectSubset<T, BidTemplateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BidTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidTemplateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BidTemplates
     * const bidTemplate = await prisma.bidTemplate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BidTemplateUpdateManyArgs>(args: SelectSubset<T, BidTemplateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one BidTemplate.
     * @param {BidTemplateUpsertArgs} args - Arguments to update or create a BidTemplate.
     * @example
     * // Update or create a BidTemplate
     * const bidTemplate = await prisma.bidTemplate.upsert({
     *   create: {
     *     // ... data to create a BidTemplate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BidTemplate we want to update
     *   }
     * })
     */
    upsert<T extends BidTemplateUpsertArgs>(args: SelectSubset<T, BidTemplateUpsertArgs<ExtArgs>>): Prisma__BidTemplateClient<$Result.GetResult<Prisma.$BidTemplatePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of BidTemplates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidTemplateCountArgs} args - Arguments to filter BidTemplates to count.
     * @example
     * // Count the number of BidTemplates
     * const count = await prisma.bidTemplate.count({
     *   where: {
     *     // ... the filter for the BidTemplates we want to count
     *   }
     * })
    **/
    count<T extends BidTemplateCountArgs>(
      args?: Subset<T, BidTemplateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BidTemplateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BidTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidTemplateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BidTemplateAggregateArgs>(args: Subset<T, BidTemplateAggregateArgs>): Prisma.PrismaPromise<GetBidTemplateAggregateType<T>>

    /**
     * Group by BidTemplate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BidTemplateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BidTemplateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BidTemplateGroupByArgs['orderBy'] }
        : { orderBy?: BidTemplateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BidTemplateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBidTemplateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BidTemplate model
   */
  readonly fields: BidTemplateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BidTemplate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BidTemplateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BidTemplate model
   */ 
  interface BidTemplateFieldRefs {
    readonly id: FieldRef<"BidTemplate", 'String'>
    readonly merchantId: FieldRef<"BidTemplate", 'String'>
    readonly name: FieldRef<"BidTemplate", 'String'>
    readonly description: FieldRef<"BidTemplate", 'String'>
    readonly amountType: FieldRef<"BidTemplate", 'AmountType'>
    readonly amountPercentage: FieldRef<"BidTemplate", 'Decimal'>
    readonly fixedAmount: FieldRef<"BidTemplate", 'Decimal'>
    readonly deliveryDays: FieldRef<"BidTemplate", 'Int'>
    readonly deliveryNotes: FieldRef<"BidTemplate", 'String'>
    readonly specialTerms: FieldRef<"BidTemplate", 'String'>
    readonly isActive: FieldRef<"BidTemplate", 'Boolean'>
    readonly usageCount: FieldRef<"BidTemplate", 'Int'>
    readonly successCount: FieldRef<"BidTemplate", 'Int'>
    readonly createdAt: FieldRef<"BidTemplate", 'DateTime'>
    readonly updatedAt: FieldRef<"BidTemplate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BidTemplate findUnique
   */
  export type BidTemplateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BidTemplate
     */
    select?: BidTemplateSelect<ExtArgs> | null
    /**
     * Filter, which BidTemplate to fetch.
     */
    where: BidTemplateWhereUniqueInput
  }

  /**
   * BidTemplate findUniqueOrThrow
   */
  export type BidTemplateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BidTemplate
     */
    select?: BidTemplateSelect<ExtArgs> | null
    /**
     * Filter, which BidTemplate to fetch.
     */
    where: BidTemplateWhereUniqueInput
  }

  /**
   * BidTemplate findFirst
   */
  export type BidTemplateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BidTemplate
     */
    select?: BidTemplateSelect<ExtArgs> | null
    /**
     * Filter, which BidTemplate to fetch.
     */
    where?: BidTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BidTemplates to fetch.
     */
    orderBy?: BidTemplateOrderByWithRelationInput | BidTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BidTemplates.
     */
    cursor?: BidTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BidTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BidTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BidTemplates.
     */
    distinct?: BidTemplateScalarFieldEnum | BidTemplateScalarFieldEnum[]
  }

  /**
   * BidTemplate findFirstOrThrow
   */
  export type BidTemplateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BidTemplate
     */
    select?: BidTemplateSelect<ExtArgs> | null
    /**
     * Filter, which BidTemplate to fetch.
     */
    where?: BidTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BidTemplates to fetch.
     */
    orderBy?: BidTemplateOrderByWithRelationInput | BidTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BidTemplates.
     */
    cursor?: BidTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BidTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BidTemplates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BidTemplates.
     */
    distinct?: BidTemplateScalarFieldEnum | BidTemplateScalarFieldEnum[]
  }

  /**
   * BidTemplate findMany
   */
  export type BidTemplateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BidTemplate
     */
    select?: BidTemplateSelect<ExtArgs> | null
    /**
     * Filter, which BidTemplates to fetch.
     */
    where?: BidTemplateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BidTemplates to fetch.
     */
    orderBy?: BidTemplateOrderByWithRelationInput | BidTemplateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BidTemplates.
     */
    cursor?: BidTemplateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BidTemplates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BidTemplates.
     */
    skip?: number
    distinct?: BidTemplateScalarFieldEnum | BidTemplateScalarFieldEnum[]
  }

  /**
   * BidTemplate create
   */
  export type BidTemplateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BidTemplate
     */
    select?: BidTemplateSelect<ExtArgs> | null
    /**
     * The data needed to create a BidTemplate.
     */
    data: XOR<BidTemplateCreateInput, BidTemplateUncheckedCreateInput>
  }

  /**
   * BidTemplate createMany
   */
  export type BidTemplateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BidTemplates.
     */
    data: BidTemplateCreateManyInput | BidTemplateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BidTemplate createManyAndReturn
   */
  export type BidTemplateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BidTemplate
     */
    select?: BidTemplateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many BidTemplates.
     */
    data: BidTemplateCreateManyInput | BidTemplateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BidTemplate update
   */
  export type BidTemplateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BidTemplate
     */
    select?: BidTemplateSelect<ExtArgs> | null
    /**
     * The data needed to update a BidTemplate.
     */
    data: XOR<BidTemplateUpdateInput, BidTemplateUncheckedUpdateInput>
    /**
     * Choose, which BidTemplate to update.
     */
    where: BidTemplateWhereUniqueInput
  }

  /**
   * BidTemplate updateMany
   */
  export type BidTemplateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BidTemplates.
     */
    data: XOR<BidTemplateUpdateManyMutationInput, BidTemplateUncheckedUpdateManyInput>
    /**
     * Filter which BidTemplates to update
     */
    where?: BidTemplateWhereInput
  }

  /**
   * BidTemplate upsert
   */
  export type BidTemplateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BidTemplate
     */
    select?: BidTemplateSelect<ExtArgs> | null
    /**
     * The filter to search for the BidTemplate to update in case it exists.
     */
    where: BidTemplateWhereUniqueInput
    /**
     * In case the BidTemplate found by the `where` argument doesn't exist, create a new BidTemplate with this data.
     */
    create: XOR<BidTemplateCreateInput, BidTemplateUncheckedCreateInput>
    /**
     * In case the BidTemplate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BidTemplateUpdateInput, BidTemplateUncheckedUpdateInput>
  }

  /**
   * BidTemplate delete
   */
  export type BidTemplateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BidTemplate
     */
    select?: BidTemplateSelect<ExtArgs> | null
    /**
     * Filter which BidTemplate to delete.
     */
    where: BidTemplateWhereUniqueInput
  }

  /**
   * BidTemplate deleteMany
   */
  export type BidTemplateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BidTemplates to delete
     */
    where?: BidTemplateWhereInput
  }

  /**
   * BidTemplate without action
   */
  export type BidTemplateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BidTemplate
     */
    select?: BidTemplateSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    phone: 'phone',
    role: 'role',
    status: 'status',
    phoneVerified: 'phoneVerified',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    lastLoginAt: 'lastLoginAt',
    failedLoginAttempts: 'failedLoginAttempts',
    lockedUntil: 'lockedUntil',
    adminSubRole: 'adminSubRole'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const UserProfileScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    firstName: 'firstName',
    lastName: 'lastName',
    profileImageUrl: 'profileImageUrl',
    locationLat: 'locationLat',
    locationLng: 'locationLng',
    address: 'address',
    city: 'city',
    country: 'country',
    preferences: 'preferences',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserProfileScalarFieldEnum = (typeof UserProfileScalarFieldEnum)[keyof typeof UserProfileScalarFieldEnum]


  export const AuthTokenScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    tokenType: 'tokenType',
    tokenHash: 'tokenHash',
    deviceFingerprint: 'deviceFingerprint',
    ipAddress: 'ipAddress',
    userAgent: 'userAgent',
    expiresAt: 'expiresAt',
    lastUsedAt: 'lastUsedAt',
    createdAt: 'createdAt',
    revokedAt: 'revokedAt'
  };

  export type AuthTokenScalarFieldEnum = (typeof AuthTokenScalarFieldEnum)[keyof typeof AuthTokenScalarFieldEnum]


  export const RequestCategoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    slug: 'slug',
    description: 'description',
    parentId: 'parentId',
    iconUrl: 'iconUrl',
    isActive: 'isActive',
    sortOrder: 'sortOrder',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RequestCategoryScalarFieldEnum = (typeof RequestCategoryScalarFieldEnum)[keyof typeof RequestCategoryScalarFieldEnum]


  export const RequestScalarFieldEnum: {
    id: 'id',
    buyerId: 'buyerId',
    categoryId: 'categoryId',
    title: 'title',
    description: 'description',
    budgetMin: 'budgetMin',
    budgetMax: 'budgetMax',
    locationLat: 'locationLat',
    locationLng: 'locationLng',
    locationAddress: 'locationAddress',
    locationCity: 'locationCity',
    locationCountry: 'locationCountry',
    status: 'status',
    priorityScore: 'priorityScore',
    bidCount: 'bidCount',
    viewCount: 'viewCount',
    expiresAt: 'expiresAt',
    publishedAt: 'publishedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RequestScalarFieldEnum = (typeof RequestScalarFieldEnum)[keyof typeof RequestScalarFieldEnum]


  export const RequestImageScalarFieldEnum: {
    id: 'id',
    requestId: 'requestId',
    imageUrl: 'imageUrl',
    thumbnailUrl: 'thumbnailUrl',
    originalFilename: 'originalFilename',
    fileSize: 'fileSize',
    mimeType: 'mimeType',
    width: 'width',
    height: 'height',
    sortOrder: 'sortOrder',
    isPrimary: 'isPrimary',
    createdAt: 'createdAt'
  };

  export type RequestImageScalarFieldEnum = (typeof RequestImageScalarFieldEnum)[keyof typeof RequestImageScalarFieldEnum]


  export const RequestDraftScalarFieldEnum: {
    id: 'id',
    buyerId: 'buyerId',
    categoryId: 'categoryId',
    title: 'title',
    description: 'description',
    budgetMin: 'budgetMin',
    budgetMax: 'budgetMax',
    locationLat: 'locationLat',
    locationLng: 'locationLng',
    locationAddress: 'locationAddress',
    autoSaveData: 'autoSaveData',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type RequestDraftScalarFieldEnum = (typeof RequestDraftScalarFieldEnum)[keyof typeof RequestDraftScalarFieldEnum]


  export const RequestExtensionScalarFieldEnum: {
    id: 'id',
    requestId: 'requestId',
    originalExpiresAt: 'originalExpiresAt',
    newExpiresAt: 'newExpiresAt',
    extensionReason: 'extensionReason',
    extendedBy: 'extendedBy',
    createdAt: 'createdAt'
  };

  export type RequestExtensionScalarFieldEnum = (typeof RequestExtensionScalarFieldEnum)[keyof typeof RequestExtensionScalarFieldEnum]


  export const RequestSearchIndexScalarFieldEnum: {
    id: 'id',
    requestId: 'requestId',
    searchVector: 'searchVector',
    categoryPath: 'categoryPath',
    locationText: 'locationText',
    budgetRange: 'budgetRange',
    createdAt: 'createdAt'
  };

  export type RequestSearchIndexScalarFieldEnum = (typeof RequestSearchIndexScalarFieldEnum)[keyof typeof RequestSearchIndexScalarFieldEnum]


  export const SavedSearchScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    searchCriteria: 'searchCriteria',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SavedSearchScalarFieldEnum = (typeof SavedSearchScalarFieldEnum)[keyof typeof SavedSearchScalarFieldEnum]


  export const BidScalarFieldEnum: {
    id: 'id',
    requestId: 'requestId',
    merchantId: 'merchantId',
    amount: 'amount',
    deliveryDays: 'deliveryDays',
    deliveryNotes: 'deliveryNotes',
    specialTerms: 'specialTerms',
    status: 'status',
    priorityScore: 'priorityScore',
    isTemplate: 'isTemplate',
    templateName: 'templateName',
    bidFee: 'bidFee',
    feePaid: 'feePaid',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    expiresAt: 'expiresAt',
    acceptedAt: 'acceptedAt',
    rejectedAt: 'rejectedAt',
    withdrawnAt: 'withdrawnAt'
  };

  export type BidScalarFieldEnum = (typeof BidScalarFieldEnum)[keyof typeof BidScalarFieldEnum]


  export const BidTemplateScalarFieldEnum: {
    id: 'id',
    merchantId: 'merchantId',
    name: 'name',
    description: 'description',
    amountType: 'amountType',
    amountPercentage: 'amountPercentage',
    fixedAmount: 'fixedAmount',
    deliveryDays: 'deliveryDays',
    deliveryNotes: 'deliveryNotes',
    specialTerms: 'specialTerms',
    isActive: 'isActive',
    usageCount: 'usageCount',
    successCount: 'successCount',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type BidTemplateScalarFieldEnum = (typeof BidTemplateScalarFieldEnum)[keyof typeof BidTemplateScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'UserRole'
   */
  export type EnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole'>
    


  /**
   * Reference to a field of type 'UserRole[]'
   */
  export type ListEnumUserRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserRole[]'>
    


  /**
   * Reference to a field of type 'UserStatus'
   */
  export type EnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus'>
    


  /**
   * Reference to a field of type 'UserStatus[]'
   */
  export type ListEnumUserStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UserStatus[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'AdminSubRole'
   */
  export type EnumAdminSubRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AdminSubRole'>
    


  /**
   * Reference to a field of type 'AdminSubRole[]'
   */
  export type ListEnumAdminSubRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AdminSubRole[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'TokenType'
   */
  export type EnumTokenTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TokenType'>
    


  /**
   * Reference to a field of type 'TokenType[]'
   */
  export type ListEnumTokenTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TokenType[]'>
    


  /**
   * Reference to a field of type 'RequestStatus'
   */
  export type EnumRequestStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RequestStatus'>
    


  /**
   * Reference to a field of type 'RequestStatus[]'
   */
  export type ListEnumRequestStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'RequestStatus[]'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'BidStatus'
   */
  export type EnumBidStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BidStatus'>
    


  /**
   * Reference to a field of type 'BidStatus[]'
   */
  export type ListEnumBidStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BidStatus[]'>
    


  /**
   * Reference to a field of type 'AmountType'
   */
  export type EnumAmountTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AmountType'>
    


  /**
   * Reference to a field of type 'AmountType[]'
   */
  export type ListEnumAmountTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AmountType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: UuidFilter<"User"> | string
    phone?: StringFilter<"User"> | string
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    status?: EnumUserStatusFilter<"User"> | $Enums.UserStatus
    phoneVerified?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    failedLoginAttempts?: IntFilter<"User"> | number
    lockedUntil?: DateTimeNullableFilter<"User"> | Date | string | null
    adminSubRole?: EnumAdminSubRoleNullableFilter<"User"> | $Enums.AdminSubRole | null
    profile?: XOR<UserProfileNullableRelationFilter, UserProfileWhereInput> | null
    authTokens?: AuthTokenListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    phone?: SortOrder
    role?: SortOrder
    status?: SortOrder
    phoneVerified?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    failedLoginAttempts?: SortOrder
    lockedUntil?: SortOrderInput | SortOrder
    adminSubRole?: SortOrderInput | SortOrder
    profile?: UserProfileOrderByWithRelationInput
    authTokens?: AuthTokenOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    phone?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    role?: EnumUserRoleFilter<"User"> | $Enums.UserRole
    status?: EnumUserStatusFilter<"User"> | $Enums.UserStatus
    phoneVerified?: BoolFilter<"User"> | boolean
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    lastLoginAt?: DateTimeNullableFilter<"User"> | Date | string | null
    failedLoginAttempts?: IntFilter<"User"> | number
    lockedUntil?: DateTimeNullableFilter<"User"> | Date | string | null
    adminSubRole?: EnumAdminSubRoleNullableFilter<"User"> | $Enums.AdminSubRole | null
    profile?: XOR<UserProfileNullableRelationFilter, UserProfileWhereInput> | null
    authTokens?: AuthTokenListRelationFilter
  }, "id" | "phone">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    phone?: SortOrder
    role?: SortOrder
    status?: SortOrder
    phoneVerified?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrderInput | SortOrder
    failedLoginAttempts?: SortOrder
    lockedUntil?: SortOrderInput | SortOrder
    adminSubRole?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"User"> | string
    phone?: StringWithAggregatesFilter<"User"> | string
    role?: EnumUserRoleWithAggregatesFilter<"User"> | $Enums.UserRole
    status?: EnumUserStatusWithAggregatesFilter<"User"> | $Enums.UserStatus
    phoneVerified?: BoolWithAggregatesFilter<"User"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    lastLoginAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    failedLoginAttempts?: IntWithAggregatesFilter<"User"> | number
    lockedUntil?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    adminSubRole?: EnumAdminSubRoleNullableWithAggregatesFilter<"User"> | $Enums.AdminSubRole | null
  }

  export type UserProfileWhereInput = {
    AND?: UserProfileWhereInput | UserProfileWhereInput[]
    OR?: UserProfileWhereInput[]
    NOT?: UserProfileWhereInput | UserProfileWhereInput[]
    id?: UuidFilter<"UserProfile"> | string
    userId?: UuidFilter<"UserProfile"> | string
    firstName?: StringFilter<"UserProfile"> | string
    lastName?: StringFilter<"UserProfile"> | string
    profileImageUrl?: StringNullableFilter<"UserProfile"> | string | null
    locationLat?: DecimalNullableFilter<"UserProfile"> | Decimal | DecimalJsLike | number | string | null
    locationLng?: DecimalNullableFilter<"UserProfile"> | Decimal | DecimalJsLike | number | string | null
    address?: StringNullableFilter<"UserProfile"> | string | null
    city?: StringNullableFilter<"UserProfile"> | string | null
    country?: StringNullableFilter<"UserProfile"> | string | null
    preferences?: JsonFilter<"UserProfile">
    createdAt?: DateTimeFilter<"UserProfile"> | Date | string
    updatedAt?: DateTimeFilter<"UserProfile"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type UserProfileOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    profileImageUrl?: SortOrderInput | SortOrder
    locationLat?: SortOrderInput | SortOrder
    locationLng?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    preferences?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: UserProfileWhereInput | UserProfileWhereInput[]
    OR?: UserProfileWhereInput[]
    NOT?: UserProfileWhereInput | UserProfileWhereInput[]
    firstName?: StringFilter<"UserProfile"> | string
    lastName?: StringFilter<"UserProfile"> | string
    profileImageUrl?: StringNullableFilter<"UserProfile"> | string | null
    locationLat?: DecimalNullableFilter<"UserProfile"> | Decimal | DecimalJsLike | number | string | null
    locationLng?: DecimalNullableFilter<"UserProfile"> | Decimal | DecimalJsLike | number | string | null
    address?: StringNullableFilter<"UserProfile"> | string | null
    city?: StringNullableFilter<"UserProfile"> | string | null
    country?: StringNullableFilter<"UserProfile"> | string | null
    preferences?: JsonFilter<"UserProfile">
    createdAt?: DateTimeFilter<"UserProfile"> | Date | string
    updatedAt?: DateTimeFilter<"UserProfile"> | Date | string
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type UserProfileOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    profileImageUrl?: SortOrderInput | SortOrder
    locationLat?: SortOrderInput | SortOrder
    locationLng?: SortOrderInput | SortOrder
    address?: SortOrderInput | SortOrder
    city?: SortOrderInput | SortOrder
    country?: SortOrderInput | SortOrder
    preferences?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserProfileCountOrderByAggregateInput
    _avg?: UserProfileAvgOrderByAggregateInput
    _max?: UserProfileMaxOrderByAggregateInput
    _min?: UserProfileMinOrderByAggregateInput
    _sum?: UserProfileSumOrderByAggregateInput
  }

  export type UserProfileScalarWhereWithAggregatesInput = {
    AND?: UserProfileScalarWhereWithAggregatesInput | UserProfileScalarWhereWithAggregatesInput[]
    OR?: UserProfileScalarWhereWithAggregatesInput[]
    NOT?: UserProfileScalarWhereWithAggregatesInput | UserProfileScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"UserProfile"> | string
    userId?: UuidWithAggregatesFilter<"UserProfile"> | string
    firstName?: StringWithAggregatesFilter<"UserProfile"> | string
    lastName?: StringWithAggregatesFilter<"UserProfile"> | string
    profileImageUrl?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    locationLat?: DecimalNullableWithAggregatesFilter<"UserProfile"> | Decimal | DecimalJsLike | number | string | null
    locationLng?: DecimalNullableWithAggregatesFilter<"UserProfile"> | Decimal | DecimalJsLike | number | string | null
    address?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    city?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    country?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    preferences?: JsonWithAggregatesFilter<"UserProfile">
    createdAt?: DateTimeWithAggregatesFilter<"UserProfile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserProfile"> | Date | string
  }

  export type AuthTokenWhereInput = {
    AND?: AuthTokenWhereInput | AuthTokenWhereInput[]
    OR?: AuthTokenWhereInput[]
    NOT?: AuthTokenWhereInput | AuthTokenWhereInput[]
    id?: UuidFilter<"AuthToken"> | string
    userId?: UuidFilter<"AuthToken"> | string
    tokenType?: EnumTokenTypeFilter<"AuthToken"> | $Enums.TokenType
    tokenHash?: StringFilter<"AuthToken"> | string
    deviceFingerprint?: StringNullableFilter<"AuthToken"> | string | null
    ipAddress?: StringNullableFilter<"AuthToken"> | string | null
    userAgent?: StringNullableFilter<"AuthToken"> | string | null
    expiresAt?: DateTimeFilter<"AuthToken"> | Date | string
    lastUsedAt?: DateTimeNullableFilter<"AuthToken"> | Date | string | null
    createdAt?: DateTimeFilter<"AuthToken"> | Date | string
    revokedAt?: DateTimeNullableFilter<"AuthToken"> | Date | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
  }

  export type AuthTokenOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenType?: SortOrder
    tokenHash?: SortOrder
    deviceFingerprint?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    expiresAt?: SortOrder
    lastUsedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    revokedAt?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type AuthTokenWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AuthTokenWhereInput | AuthTokenWhereInput[]
    OR?: AuthTokenWhereInput[]
    NOT?: AuthTokenWhereInput | AuthTokenWhereInput[]
    userId?: UuidFilter<"AuthToken"> | string
    tokenType?: EnumTokenTypeFilter<"AuthToken"> | $Enums.TokenType
    tokenHash?: StringFilter<"AuthToken"> | string
    deviceFingerprint?: StringNullableFilter<"AuthToken"> | string | null
    ipAddress?: StringNullableFilter<"AuthToken"> | string | null
    userAgent?: StringNullableFilter<"AuthToken"> | string | null
    expiresAt?: DateTimeFilter<"AuthToken"> | Date | string
    lastUsedAt?: DateTimeNullableFilter<"AuthToken"> | Date | string | null
    createdAt?: DateTimeFilter<"AuthToken"> | Date | string
    revokedAt?: DateTimeNullableFilter<"AuthToken"> | Date | string | null
    user?: XOR<UserRelationFilter, UserWhereInput>
  }, "id">

  export type AuthTokenOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenType?: SortOrder
    tokenHash?: SortOrder
    deviceFingerprint?: SortOrderInput | SortOrder
    ipAddress?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    expiresAt?: SortOrder
    lastUsedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    revokedAt?: SortOrderInput | SortOrder
    _count?: AuthTokenCountOrderByAggregateInput
    _max?: AuthTokenMaxOrderByAggregateInput
    _min?: AuthTokenMinOrderByAggregateInput
  }

  export type AuthTokenScalarWhereWithAggregatesInput = {
    AND?: AuthTokenScalarWhereWithAggregatesInput | AuthTokenScalarWhereWithAggregatesInput[]
    OR?: AuthTokenScalarWhereWithAggregatesInput[]
    NOT?: AuthTokenScalarWhereWithAggregatesInput | AuthTokenScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"AuthToken"> | string
    userId?: UuidWithAggregatesFilter<"AuthToken"> | string
    tokenType?: EnumTokenTypeWithAggregatesFilter<"AuthToken"> | $Enums.TokenType
    tokenHash?: StringWithAggregatesFilter<"AuthToken"> | string
    deviceFingerprint?: StringNullableWithAggregatesFilter<"AuthToken"> | string | null
    ipAddress?: StringNullableWithAggregatesFilter<"AuthToken"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"AuthToken"> | string | null
    expiresAt?: DateTimeWithAggregatesFilter<"AuthToken"> | Date | string
    lastUsedAt?: DateTimeNullableWithAggregatesFilter<"AuthToken"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"AuthToken"> | Date | string
    revokedAt?: DateTimeNullableWithAggregatesFilter<"AuthToken"> | Date | string | null
  }

  export type RequestCategoryWhereInput = {
    AND?: RequestCategoryWhereInput | RequestCategoryWhereInput[]
    OR?: RequestCategoryWhereInput[]
    NOT?: RequestCategoryWhereInput | RequestCategoryWhereInput[]
    id?: UuidFilter<"RequestCategory"> | string
    name?: StringFilter<"RequestCategory"> | string
    slug?: StringFilter<"RequestCategory"> | string
    description?: StringNullableFilter<"RequestCategory"> | string | null
    parentId?: UuidNullableFilter<"RequestCategory"> | string | null
    iconUrl?: StringNullableFilter<"RequestCategory"> | string | null
    isActive?: BoolFilter<"RequestCategory"> | boolean
    sortOrder?: IntFilter<"RequestCategory"> | number
    createdAt?: DateTimeFilter<"RequestCategory"> | Date | string
    updatedAt?: DateTimeFilter<"RequestCategory"> | Date | string
    parent?: XOR<RequestCategoryNullableRelationFilter, RequestCategoryWhereInput> | null
    children?: RequestCategoryListRelationFilter
    requests?: RequestListRelationFilter
    drafts?: RequestDraftListRelationFilter
  }

  export type RequestCategoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    parentId?: SortOrderInput | SortOrder
    iconUrl?: SortOrderInput | SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    parent?: RequestCategoryOrderByWithRelationInput
    children?: RequestCategoryOrderByRelationAggregateInput
    requests?: RequestOrderByRelationAggregateInput
    drafts?: RequestDraftOrderByRelationAggregateInput
  }

  export type RequestCategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    slug?: string
    AND?: RequestCategoryWhereInput | RequestCategoryWhereInput[]
    OR?: RequestCategoryWhereInput[]
    NOT?: RequestCategoryWhereInput | RequestCategoryWhereInput[]
    name?: StringFilter<"RequestCategory"> | string
    description?: StringNullableFilter<"RequestCategory"> | string | null
    parentId?: UuidNullableFilter<"RequestCategory"> | string | null
    iconUrl?: StringNullableFilter<"RequestCategory"> | string | null
    isActive?: BoolFilter<"RequestCategory"> | boolean
    sortOrder?: IntFilter<"RequestCategory"> | number
    createdAt?: DateTimeFilter<"RequestCategory"> | Date | string
    updatedAt?: DateTimeFilter<"RequestCategory"> | Date | string
    parent?: XOR<RequestCategoryNullableRelationFilter, RequestCategoryWhereInput> | null
    children?: RequestCategoryListRelationFilter
    requests?: RequestListRelationFilter
    drafts?: RequestDraftListRelationFilter
  }, "id" | "slug">

  export type RequestCategoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrderInput | SortOrder
    parentId?: SortOrderInput | SortOrder
    iconUrl?: SortOrderInput | SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RequestCategoryCountOrderByAggregateInput
    _avg?: RequestCategoryAvgOrderByAggregateInput
    _max?: RequestCategoryMaxOrderByAggregateInput
    _min?: RequestCategoryMinOrderByAggregateInput
    _sum?: RequestCategorySumOrderByAggregateInput
  }

  export type RequestCategoryScalarWhereWithAggregatesInput = {
    AND?: RequestCategoryScalarWhereWithAggregatesInput | RequestCategoryScalarWhereWithAggregatesInput[]
    OR?: RequestCategoryScalarWhereWithAggregatesInput[]
    NOT?: RequestCategoryScalarWhereWithAggregatesInput | RequestCategoryScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"RequestCategory"> | string
    name?: StringWithAggregatesFilter<"RequestCategory"> | string
    slug?: StringWithAggregatesFilter<"RequestCategory"> | string
    description?: StringNullableWithAggregatesFilter<"RequestCategory"> | string | null
    parentId?: UuidNullableWithAggregatesFilter<"RequestCategory"> | string | null
    iconUrl?: StringNullableWithAggregatesFilter<"RequestCategory"> | string | null
    isActive?: BoolWithAggregatesFilter<"RequestCategory"> | boolean
    sortOrder?: IntWithAggregatesFilter<"RequestCategory"> | number
    createdAt?: DateTimeWithAggregatesFilter<"RequestCategory"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RequestCategory"> | Date | string
  }

  export type RequestWhereInput = {
    AND?: RequestWhereInput | RequestWhereInput[]
    OR?: RequestWhereInput[]
    NOT?: RequestWhereInput | RequestWhereInput[]
    id?: UuidFilter<"Request"> | string
    buyerId?: UuidFilter<"Request"> | string
    categoryId?: UuidFilter<"Request"> | string
    title?: StringFilter<"Request"> | string
    description?: StringFilter<"Request"> | string
    budgetMin?: DecimalNullableFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    budgetMax?: DecimalNullableFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    locationLat?: DecimalNullableFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    locationLng?: DecimalNullableFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    locationAddress?: StringNullableFilter<"Request"> | string | null
    locationCity?: StringNullableFilter<"Request"> | string | null
    locationCountry?: StringNullableFilter<"Request"> | string | null
    status?: EnumRequestStatusFilter<"Request"> | $Enums.RequestStatus
    priorityScore?: IntFilter<"Request"> | number
    bidCount?: IntFilter<"Request"> | number
    viewCount?: IntFilter<"Request"> | number
    expiresAt?: DateTimeNullableFilter<"Request"> | Date | string | null
    publishedAt?: DateTimeNullableFilter<"Request"> | Date | string | null
    createdAt?: DateTimeFilter<"Request"> | Date | string
    updatedAt?: DateTimeFilter<"Request"> | Date | string
    category?: XOR<RequestCategoryRelationFilter, RequestCategoryWhereInput>
    images?: RequestImageListRelationFilter
    extensions?: RequestExtensionListRelationFilter
    searchIndex?: XOR<RequestSearchIndexNullableRelationFilter, RequestSearchIndexWhereInput> | null
  }

  export type RequestOrderByWithRelationInput = {
    id?: SortOrder
    buyerId?: SortOrder
    categoryId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    budgetMin?: SortOrderInput | SortOrder
    budgetMax?: SortOrderInput | SortOrder
    locationLat?: SortOrderInput | SortOrder
    locationLng?: SortOrderInput | SortOrder
    locationAddress?: SortOrderInput | SortOrder
    locationCity?: SortOrderInput | SortOrder
    locationCountry?: SortOrderInput | SortOrder
    status?: SortOrder
    priorityScore?: SortOrder
    bidCount?: SortOrder
    viewCount?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    publishedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    category?: RequestCategoryOrderByWithRelationInput
    images?: RequestImageOrderByRelationAggregateInput
    extensions?: RequestExtensionOrderByRelationAggregateInput
    searchIndex?: RequestSearchIndexOrderByWithRelationInput
  }

  export type RequestWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RequestWhereInput | RequestWhereInput[]
    OR?: RequestWhereInput[]
    NOT?: RequestWhereInput | RequestWhereInput[]
    buyerId?: UuidFilter<"Request"> | string
    categoryId?: UuidFilter<"Request"> | string
    title?: StringFilter<"Request"> | string
    description?: StringFilter<"Request"> | string
    budgetMin?: DecimalNullableFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    budgetMax?: DecimalNullableFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    locationLat?: DecimalNullableFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    locationLng?: DecimalNullableFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    locationAddress?: StringNullableFilter<"Request"> | string | null
    locationCity?: StringNullableFilter<"Request"> | string | null
    locationCountry?: StringNullableFilter<"Request"> | string | null
    status?: EnumRequestStatusFilter<"Request"> | $Enums.RequestStatus
    priorityScore?: IntFilter<"Request"> | number
    bidCount?: IntFilter<"Request"> | number
    viewCount?: IntFilter<"Request"> | number
    expiresAt?: DateTimeNullableFilter<"Request"> | Date | string | null
    publishedAt?: DateTimeNullableFilter<"Request"> | Date | string | null
    createdAt?: DateTimeFilter<"Request"> | Date | string
    updatedAt?: DateTimeFilter<"Request"> | Date | string
    category?: XOR<RequestCategoryRelationFilter, RequestCategoryWhereInput>
    images?: RequestImageListRelationFilter
    extensions?: RequestExtensionListRelationFilter
    searchIndex?: XOR<RequestSearchIndexNullableRelationFilter, RequestSearchIndexWhereInput> | null
  }, "id">

  export type RequestOrderByWithAggregationInput = {
    id?: SortOrder
    buyerId?: SortOrder
    categoryId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    budgetMin?: SortOrderInput | SortOrder
    budgetMax?: SortOrderInput | SortOrder
    locationLat?: SortOrderInput | SortOrder
    locationLng?: SortOrderInput | SortOrder
    locationAddress?: SortOrderInput | SortOrder
    locationCity?: SortOrderInput | SortOrder
    locationCountry?: SortOrderInput | SortOrder
    status?: SortOrder
    priorityScore?: SortOrder
    bidCount?: SortOrder
    viewCount?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    publishedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RequestCountOrderByAggregateInput
    _avg?: RequestAvgOrderByAggregateInput
    _max?: RequestMaxOrderByAggregateInput
    _min?: RequestMinOrderByAggregateInput
    _sum?: RequestSumOrderByAggregateInput
  }

  export type RequestScalarWhereWithAggregatesInput = {
    AND?: RequestScalarWhereWithAggregatesInput | RequestScalarWhereWithAggregatesInput[]
    OR?: RequestScalarWhereWithAggregatesInput[]
    NOT?: RequestScalarWhereWithAggregatesInput | RequestScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Request"> | string
    buyerId?: UuidWithAggregatesFilter<"Request"> | string
    categoryId?: UuidWithAggregatesFilter<"Request"> | string
    title?: StringWithAggregatesFilter<"Request"> | string
    description?: StringWithAggregatesFilter<"Request"> | string
    budgetMin?: DecimalNullableWithAggregatesFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    budgetMax?: DecimalNullableWithAggregatesFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    locationLat?: DecimalNullableWithAggregatesFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    locationLng?: DecimalNullableWithAggregatesFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    locationAddress?: StringNullableWithAggregatesFilter<"Request"> | string | null
    locationCity?: StringNullableWithAggregatesFilter<"Request"> | string | null
    locationCountry?: StringNullableWithAggregatesFilter<"Request"> | string | null
    status?: EnumRequestStatusWithAggregatesFilter<"Request"> | $Enums.RequestStatus
    priorityScore?: IntWithAggregatesFilter<"Request"> | number
    bidCount?: IntWithAggregatesFilter<"Request"> | number
    viewCount?: IntWithAggregatesFilter<"Request"> | number
    expiresAt?: DateTimeNullableWithAggregatesFilter<"Request"> | Date | string | null
    publishedAt?: DateTimeNullableWithAggregatesFilter<"Request"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Request"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Request"> | Date | string
  }

  export type RequestImageWhereInput = {
    AND?: RequestImageWhereInput | RequestImageWhereInput[]
    OR?: RequestImageWhereInput[]
    NOT?: RequestImageWhereInput | RequestImageWhereInput[]
    id?: UuidFilter<"RequestImage"> | string
    requestId?: UuidFilter<"RequestImage"> | string
    imageUrl?: StringFilter<"RequestImage"> | string
    thumbnailUrl?: StringNullableFilter<"RequestImage"> | string | null
    originalFilename?: StringNullableFilter<"RequestImage"> | string | null
    fileSize?: BigIntFilter<"RequestImage"> | bigint | number
    mimeType?: StringFilter<"RequestImage"> | string
    width?: IntNullableFilter<"RequestImage"> | number | null
    height?: IntNullableFilter<"RequestImage"> | number | null
    sortOrder?: IntFilter<"RequestImage"> | number
    isPrimary?: BoolFilter<"RequestImage"> | boolean
    createdAt?: DateTimeFilter<"RequestImage"> | Date | string
    request?: XOR<RequestRelationFilter, RequestWhereInput>
  }

  export type RequestImageOrderByWithRelationInput = {
    id?: SortOrder
    requestId?: SortOrder
    imageUrl?: SortOrder
    thumbnailUrl?: SortOrderInput | SortOrder
    originalFilename?: SortOrderInput | SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    width?: SortOrderInput | SortOrder
    height?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    isPrimary?: SortOrder
    createdAt?: SortOrder
    request?: RequestOrderByWithRelationInput
  }

  export type RequestImageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RequestImageWhereInput | RequestImageWhereInput[]
    OR?: RequestImageWhereInput[]
    NOT?: RequestImageWhereInput | RequestImageWhereInput[]
    requestId?: UuidFilter<"RequestImage"> | string
    imageUrl?: StringFilter<"RequestImage"> | string
    thumbnailUrl?: StringNullableFilter<"RequestImage"> | string | null
    originalFilename?: StringNullableFilter<"RequestImage"> | string | null
    fileSize?: BigIntFilter<"RequestImage"> | bigint | number
    mimeType?: StringFilter<"RequestImage"> | string
    width?: IntNullableFilter<"RequestImage"> | number | null
    height?: IntNullableFilter<"RequestImage"> | number | null
    sortOrder?: IntFilter<"RequestImage"> | number
    isPrimary?: BoolFilter<"RequestImage"> | boolean
    createdAt?: DateTimeFilter<"RequestImage"> | Date | string
    request?: XOR<RequestRelationFilter, RequestWhereInput>
  }, "id">

  export type RequestImageOrderByWithAggregationInput = {
    id?: SortOrder
    requestId?: SortOrder
    imageUrl?: SortOrder
    thumbnailUrl?: SortOrderInput | SortOrder
    originalFilename?: SortOrderInput | SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    width?: SortOrderInput | SortOrder
    height?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    isPrimary?: SortOrder
    createdAt?: SortOrder
    _count?: RequestImageCountOrderByAggregateInput
    _avg?: RequestImageAvgOrderByAggregateInput
    _max?: RequestImageMaxOrderByAggregateInput
    _min?: RequestImageMinOrderByAggregateInput
    _sum?: RequestImageSumOrderByAggregateInput
  }

  export type RequestImageScalarWhereWithAggregatesInput = {
    AND?: RequestImageScalarWhereWithAggregatesInput | RequestImageScalarWhereWithAggregatesInput[]
    OR?: RequestImageScalarWhereWithAggregatesInput[]
    NOT?: RequestImageScalarWhereWithAggregatesInput | RequestImageScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"RequestImage"> | string
    requestId?: UuidWithAggregatesFilter<"RequestImage"> | string
    imageUrl?: StringWithAggregatesFilter<"RequestImage"> | string
    thumbnailUrl?: StringNullableWithAggregatesFilter<"RequestImage"> | string | null
    originalFilename?: StringNullableWithAggregatesFilter<"RequestImage"> | string | null
    fileSize?: BigIntWithAggregatesFilter<"RequestImage"> | bigint | number
    mimeType?: StringWithAggregatesFilter<"RequestImage"> | string
    width?: IntNullableWithAggregatesFilter<"RequestImage"> | number | null
    height?: IntNullableWithAggregatesFilter<"RequestImage"> | number | null
    sortOrder?: IntWithAggregatesFilter<"RequestImage"> | number
    isPrimary?: BoolWithAggregatesFilter<"RequestImage"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"RequestImage"> | Date | string
  }

  export type RequestDraftWhereInput = {
    AND?: RequestDraftWhereInput | RequestDraftWhereInput[]
    OR?: RequestDraftWhereInput[]
    NOT?: RequestDraftWhereInput | RequestDraftWhereInput[]
    id?: UuidFilter<"RequestDraft"> | string
    buyerId?: UuidFilter<"RequestDraft"> | string
    categoryId?: UuidNullableFilter<"RequestDraft"> | string | null
    title?: StringNullableFilter<"RequestDraft"> | string | null
    description?: StringNullableFilter<"RequestDraft"> | string | null
    budgetMin?: DecimalNullableFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    budgetMax?: DecimalNullableFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    locationLat?: DecimalNullableFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    locationLng?: DecimalNullableFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    locationAddress?: StringNullableFilter<"RequestDraft"> | string | null
    autoSaveData?: JsonFilter<"RequestDraft">
    expiresAt?: DateTimeFilter<"RequestDraft"> | Date | string
    createdAt?: DateTimeFilter<"RequestDraft"> | Date | string
    updatedAt?: DateTimeFilter<"RequestDraft"> | Date | string
    category?: XOR<RequestCategoryNullableRelationFilter, RequestCategoryWhereInput> | null
  }

  export type RequestDraftOrderByWithRelationInput = {
    id?: SortOrder
    buyerId?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    title?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    budgetMin?: SortOrderInput | SortOrder
    budgetMax?: SortOrderInput | SortOrder
    locationLat?: SortOrderInput | SortOrder
    locationLng?: SortOrderInput | SortOrder
    locationAddress?: SortOrderInput | SortOrder
    autoSaveData?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    category?: RequestCategoryOrderByWithRelationInput
  }

  export type RequestDraftWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RequestDraftWhereInput | RequestDraftWhereInput[]
    OR?: RequestDraftWhereInput[]
    NOT?: RequestDraftWhereInput | RequestDraftWhereInput[]
    buyerId?: UuidFilter<"RequestDraft"> | string
    categoryId?: UuidNullableFilter<"RequestDraft"> | string | null
    title?: StringNullableFilter<"RequestDraft"> | string | null
    description?: StringNullableFilter<"RequestDraft"> | string | null
    budgetMin?: DecimalNullableFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    budgetMax?: DecimalNullableFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    locationLat?: DecimalNullableFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    locationLng?: DecimalNullableFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    locationAddress?: StringNullableFilter<"RequestDraft"> | string | null
    autoSaveData?: JsonFilter<"RequestDraft">
    expiresAt?: DateTimeFilter<"RequestDraft"> | Date | string
    createdAt?: DateTimeFilter<"RequestDraft"> | Date | string
    updatedAt?: DateTimeFilter<"RequestDraft"> | Date | string
    category?: XOR<RequestCategoryNullableRelationFilter, RequestCategoryWhereInput> | null
  }, "id">

  export type RequestDraftOrderByWithAggregationInput = {
    id?: SortOrder
    buyerId?: SortOrder
    categoryId?: SortOrderInput | SortOrder
    title?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    budgetMin?: SortOrderInput | SortOrder
    budgetMax?: SortOrderInput | SortOrder
    locationLat?: SortOrderInput | SortOrder
    locationLng?: SortOrderInput | SortOrder
    locationAddress?: SortOrderInput | SortOrder
    autoSaveData?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: RequestDraftCountOrderByAggregateInput
    _avg?: RequestDraftAvgOrderByAggregateInput
    _max?: RequestDraftMaxOrderByAggregateInput
    _min?: RequestDraftMinOrderByAggregateInput
    _sum?: RequestDraftSumOrderByAggregateInput
  }

  export type RequestDraftScalarWhereWithAggregatesInput = {
    AND?: RequestDraftScalarWhereWithAggregatesInput | RequestDraftScalarWhereWithAggregatesInput[]
    OR?: RequestDraftScalarWhereWithAggregatesInput[]
    NOT?: RequestDraftScalarWhereWithAggregatesInput | RequestDraftScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"RequestDraft"> | string
    buyerId?: UuidWithAggregatesFilter<"RequestDraft"> | string
    categoryId?: UuidNullableWithAggregatesFilter<"RequestDraft"> | string | null
    title?: StringNullableWithAggregatesFilter<"RequestDraft"> | string | null
    description?: StringNullableWithAggregatesFilter<"RequestDraft"> | string | null
    budgetMin?: DecimalNullableWithAggregatesFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    budgetMax?: DecimalNullableWithAggregatesFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    locationLat?: DecimalNullableWithAggregatesFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    locationLng?: DecimalNullableWithAggregatesFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    locationAddress?: StringNullableWithAggregatesFilter<"RequestDraft"> | string | null
    autoSaveData?: JsonWithAggregatesFilter<"RequestDraft">
    expiresAt?: DateTimeWithAggregatesFilter<"RequestDraft"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"RequestDraft"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"RequestDraft"> | Date | string
  }

  export type RequestExtensionWhereInput = {
    AND?: RequestExtensionWhereInput | RequestExtensionWhereInput[]
    OR?: RequestExtensionWhereInput[]
    NOT?: RequestExtensionWhereInput | RequestExtensionWhereInput[]
    id?: UuidFilter<"RequestExtension"> | string
    requestId?: UuidFilter<"RequestExtension"> | string
    originalExpiresAt?: DateTimeFilter<"RequestExtension"> | Date | string
    newExpiresAt?: DateTimeFilter<"RequestExtension"> | Date | string
    extensionReason?: StringNullableFilter<"RequestExtension"> | string | null
    extendedBy?: UuidNullableFilter<"RequestExtension"> | string | null
    createdAt?: DateTimeFilter<"RequestExtension"> | Date | string
    request?: XOR<RequestRelationFilter, RequestWhereInput>
  }

  export type RequestExtensionOrderByWithRelationInput = {
    id?: SortOrder
    requestId?: SortOrder
    originalExpiresAt?: SortOrder
    newExpiresAt?: SortOrder
    extensionReason?: SortOrderInput | SortOrder
    extendedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    request?: RequestOrderByWithRelationInput
  }

  export type RequestExtensionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RequestExtensionWhereInput | RequestExtensionWhereInput[]
    OR?: RequestExtensionWhereInput[]
    NOT?: RequestExtensionWhereInput | RequestExtensionWhereInput[]
    requestId?: UuidFilter<"RequestExtension"> | string
    originalExpiresAt?: DateTimeFilter<"RequestExtension"> | Date | string
    newExpiresAt?: DateTimeFilter<"RequestExtension"> | Date | string
    extensionReason?: StringNullableFilter<"RequestExtension"> | string | null
    extendedBy?: UuidNullableFilter<"RequestExtension"> | string | null
    createdAt?: DateTimeFilter<"RequestExtension"> | Date | string
    request?: XOR<RequestRelationFilter, RequestWhereInput>
  }, "id">

  export type RequestExtensionOrderByWithAggregationInput = {
    id?: SortOrder
    requestId?: SortOrder
    originalExpiresAt?: SortOrder
    newExpiresAt?: SortOrder
    extensionReason?: SortOrderInput | SortOrder
    extendedBy?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: RequestExtensionCountOrderByAggregateInput
    _max?: RequestExtensionMaxOrderByAggregateInput
    _min?: RequestExtensionMinOrderByAggregateInput
  }

  export type RequestExtensionScalarWhereWithAggregatesInput = {
    AND?: RequestExtensionScalarWhereWithAggregatesInput | RequestExtensionScalarWhereWithAggregatesInput[]
    OR?: RequestExtensionScalarWhereWithAggregatesInput[]
    NOT?: RequestExtensionScalarWhereWithAggregatesInput | RequestExtensionScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"RequestExtension"> | string
    requestId?: UuidWithAggregatesFilter<"RequestExtension"> | string
    originalExpiresAt?: DateTimeWithAggregatesFilter<"RequestExtension"> | Date | string
    newExpiresAt?: DateTimeWithAggregatesFilter<"RequestExtension"> | Date | string
    extensionReason?: StringNullableWithAggregatesFilter<"RequestExtension"> | string | null
    extendedBy?: UuidNullableWithAggregatesFilter<"RequestExtension"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"RequestExtension"> | Date | string
  }

  export type RequestSearchIndexWhereInput = {
    AND?: RequestSearchIndexWhereInput | RequestSearchIndexWhereInput[]
    OR?: RequestSearchIndexWhereInput[]
    NOT?: RequestSearchIndexWhereInput | RequestSearchIndexWhereInput[]
    id?: UuidFilter<"RequestSearchIndex"> | string
    requestId?: UuidFilter<"RequestSearchIndex"> | string
    searchVector?: StringNullableFilter<"RequestSearchIndex"> | string | null
    categoryPath?: StringNullableFilter<"RequestSearchIndex"> | string | null
    locationText?: StringNullableFilter<"RequestSearchIndex"> | string | null
    budgetRange?: StringNullableFilter<"RequestSearchIndex"> | string | null
    createdAt?: DateTimeFilter<"RequestSearchIndex"> | Date | string
    request?: XOR<RequestRelationFilter, RequestWhereInput>
  }

  export type RequestSearchIndexOrderByWithRelationInput = {
    id?: SortOrder
    requestId?: SortOrder
    searchVector?: SortOrderInput | SortOrder
    categoryPath?: SortOrderInput | SortOrder
    locationText?: SortOrderInput | SortOrder
    budgetRange?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    request?: RequestOrderByWithRelationInput
  }

  export type RequestSearchIndexWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    requestId?: string
    AND?: RequestSearchIndexWhereInput | RequestSearchIndexWhereInput[]
    OR?: RequestSearchIndexWhereInput[]
    NOT?: RequestSearchIndexWhereInput | RequestSearchIndexWhereInput[]
    searchVector?: StringNullableFilter<"RequestSearchIndex"> | string | null
    categoryPath?: StringNullableFilter<"RequestSearchIndex"> | string | null
    locationText?: StringNullableFilter<"RequestSearchIndex"> | string | null
    budgetRange?: StringNullableFilter<"RequestSearchIndex"> | string | null
    createdAt?: DateTimeFilter<"RequestSearchIndex"> | Date | string
    request?: XOR<RequestRelationFilter, RequestWhereInput>
  }, "id" | "requestId">

  export type RequestSearchIndexOrderByWithAggregationInput = {
    id?: SortOrder
    requestId?: SortOrder
    searchVector?: SortOrderInput | SortOrder
    categoryPath?: SortOrderInput | SortOrder
    locationText?: SortOrderInput | SortOrder
    budgetRange?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: RequestSearchIndexCountOrderByAggregateInput
    _max?: RequestSearchIndexMaxOrderByAggregateInput
    _min?: RequestSearchIndexMinOrderByAggregateInput
  }

  export type RequestSearchIndexScalarWhereWithAggregatesInput = {
    AND?: RequestSearchIndexScalarWhereWithAggregatesInput | RequestSearchIndexScalarWhereWithAggregatesInput[]
    OR?: RequestSearchIndexScalarWhereWithAggregatesInput[]
    NOT?: RequestSearchIndexScalarWhereWithAggregatesInput | RequestSearchIndexScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"RequestSearchIndex"> | string
    requestId?: UuidWithAggregatesFilter<"RequestSearchIndex"> | string
    searchVector?: StringNullableWithAggregatesFilter<"RequestSearchIndex"> | string | null
    categoryPath?: StringNullableWithAggregatesFilter<"RequestSearchIndex"> | string | null
    locationText?: StringNullableWithAggregatesFilter<"RequestSearchIndex"> | string | null
    budgetRange?: StringNullableWithAggregatesFilter<"RequestSearchIndex"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"RequestSearchIndex"> | Date | string
  }

  export type SavedSearchWhereInput = {
    AND?: SavedSearchWhereInput | SavedSearchWhereInput[]
    OR?: SavedSearchWhereInput[]
    NOT?: SavedSearchWhereInput | SavedSearchWhereInput[]
    id?: UuidFilter<"SavedSearch"> | string
    userId?: UuidFilter<"SavedSearch"> | string
    name?: StringFilter<"SavedSearch"> | string
    searchCriteria?: JsonFilter<"SavedSearch">
    isActive?: BoolFilter<"SavedSearch"> | boolean
    createdAt?: DateTimeFilter<"SavedSearch"> | Date | string
    updatedAt?: DateTimeFilter<"SavedSearch"> | Date | string
  }

  export type SavedSearchOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    searchCriteria?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SavedSearchWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SavedSearchWhereInput | SavedSearchWhereInput[]
    OR?: SavedSearchWhereInput[]
    NOT?: SavedSearchWhereInput | SavedSearchWhereInput[]
    userId?: UuidFilter<"SavedSearch"> | string
    name?: StringFilter<"SavedSearch"> | string
    searchCriteria?: JsonFilter<"SavedSearch">
    isActive?: BoolFilter<"SavedSearch"> | boolean
    createdAt?: DateTimeFilter<"SavedSearch"> | Date | string
    updatedAt?: DateTimeFilter<"SavedSearch"> | Date | string
  }, "id">

  export type SavedSearchOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    searchCriteria?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SavedSearchCountOrderByAggregateInput
    _max?: SavedSearchMaxOrderByAggregateInput
    _min?: SavedSearchMinOrderByAggregateInput
  }

  export type SavedSearchScalarWhereWithAggregatesInput = {
    AND?: SavedSearchScalarWhereWithAggregatesInput | SavedSearchScalarWhereWithAggregatesInput[]
    OR?: SavedSearchScalarWhereWithAggregatesInput[]
    NOT?: SavedSearchScalarWhereWithAggregatesInput | SavedSearchScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"SavedSearch"> | string
    userId?: UuidWithAggregatesFilter<"SavedSearch"> | string
    name?: StringWithAggregatesFilter<"SavedSearch"> | string
    searchCriteria?: JsonWithAggregatesFilter<"SavedSearch">
    isActive?: BoolWithAggregatesFilter<"SavedSearch"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"SavedSearch"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SavedSearch"> | Date | string
  }

  export type BidWhereInput = {
    AND?: BidWhereInput | BidWhereInput[]
    OR?: BidWhereInput[]
    NOT?: BidWhereInput | BidWhereInput[]
    id?: UuidFilter<"Bid"> | string
    requestId?: UuidFilter<"Bid"> | string
    merchantId?: UuidFilter<"Bid"> | string
    amount?: DecimalFilter<"Bid"> | Decimal | DecimalJsLike | number | string
    deliveryDays?: IntFilter<"Bid"> | number
    deliveryNotes?: StringNullableFilter<"Bid"> | string | null
    specialTerms?: StringNullableFilter<"Bid"> | string | null
    status?: EnumBidStatusFilter<"Bid"> | $Enums.BidStatus
    priorityScore?: IntFilter<"Bid"> | number
    isTemplate?: BoolFilter<"Bid"> | boolean
    templateName?: StringNullableFilter<"Bid"> | string | null
    bidFee?: DecimalFilter<"Bid"> | Decimal | DecimalJsLike | number | string
    feePaid?: BoolFilter<"Bid"> | boolean
    createdAt?: DateTimeFilter<"Bid"> | Date | string
    updatedAt?: DateTimeFilter<"Bid"> | Date | string
    expiresAt?: DateTimeNullableFilter<"Bid"> | Date | string | null
    acceptedAt?: DateTimeNullableFilter<"Bid"> | Date | string | null
    rejectedAt?: DateTimeNullableFilter<"Bid"> | Date | string | null
    withdrawnAt?: DateTimeNullableFilter<"Bid"> | Date | string | null
  }

  export type BidOrderByWithRelationInput = {
    id?: SortOrder
    requestId?: SortOrder
    merchantId?: SortOrder
    amount?: SortOrder
    deliveryDays?: SortOrder
    deliveryNotes?: SortOrderInput | SortOrder
    specialTerms?: SortOrderInput | SortOrder
    status?: SortOrder
    priorityScore?: SortOrder
    isTemplate?: SortOrder
    templateName?: SortOrderInput | SortOrder
    bidFee?: SortOrder
    feePaid?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    acceptedAt?: SortOrderInput | SortOrder
    rejectedAt?: SortOrderInput | SortOrder
    withdrawnAt?: SortOrderInput | SortOrder
  }

  export type BidWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    requestId_merchantId?: BidRequestIdMerchantIdCompoundUniqueInput
    AND?: BidWhereInput | BidWhereInput[]
    OR?: BidWhereInput[]
    NOT?: BidWhereInput | BidWhereInput[]
    requestId?: UuidFilter<"Bid"> | string
    merchantId?: UuidFilter<"Bid"> | string
    amount?: DecimalFilter<"Bid"> | Decimal | DecimalJsLike | number | string
    deliveryDays?: IntFilter<"Bid"> | number
    deliveryNotes?: StringNullableFilter<"Bid"> | string | null
    specialTerms?: StringNullableFilter<"Bid"> | string | null
    status?: EnumBidStatusFilter<"Bid"> | $Enums.BidStatus
    priorityScore?: IntFilter<"Bid"> | number
    isTemplate?: BoolFilter<"Bid"> | boolean
    templateName?: StringNullableFilter<"Bid"> | string | null
    bidFee?: DecimalFilter<"Bid"> | Decimal | DecimalJsLike | number | string
    feePaid?: BoolFilter<"Bid"> | boolean
    createdAt?: DateTimeFilter<"Bid"> | Date | string
    updatedAt?: DateTimeFilter<"Bid"> | Date | string
    expiresAt?: DateTimeNullableFilter<"Bid"> | Date | string | null
    acceptedAt?: DateTimeNullableFilter<"Bid"> | Date | string | null
    rejectedAt?: DateTimeNullableFilter<"Bid"> | Date | string | null
    withdrawnAt?: DateTimeNullableFilter<"Bid"> | Date | string | null
  }, "id" | "requestId_merchantId">

  export type BidOrderByWithAggregationInput = {
    id?: SortOrder
    requestId?: SortOrder
    merchantId?: SortOrder
    amount?: SortOrder
    deliveryDays?: SortOrder
    deliveryNotes?: SortOrderInput | SortOrder
    specialTerms?: SortOrderInput | SortOrder
    status?: SortOrder
    priorityScore?: SortOrder
    isTemplate?: SortOrder
    templateName?: SortOrderInput | SortOrder
    bidFee?: SortOrder
    feePaid?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    acceptedAt?: SortOrderInput | SortOrder
    rejectedAt?: SortOrderInput | SortOrder
    withdrawnAt?: SortOrderInput | SortOrder
    _count?: BidCountOrderByAggregateInput
    _avg?: BidAvgOrderByAggregateInput
    _max?: BidMaxOrderByAggregateInput
    _min?: BidMinOrderByAggregateInput
    _sum?: BidSumOrderByAggregateInput
  }

  export type BidScalarWhereWithAggregatesInput = {
    AND?: BidScalarWhereWithAggregatesInput | BidScalarWhereWithAggregatesInput[]
    OR?: BidScalarWhereWithAggregatesInput[]
    NOT?: BidScalarWhereWithAggregatesInput | BidScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"Bid"> | string
    requestId?: UuidWithAggregatesFilter<"Bid"> | string
    merchantId?: UuidWithAggregatesFilter<"Bid"> | string
    amount?: DecimalWithAggregatesFilter<"Bid"> | Decimal | DecimalJsLike | number | string
    deliveryDays?: IntWithAggregatesFilter<"Bid"> | number
    deliveryNotes?: StringNullableWithAggregatesFilter<"Bid"> | string | null
    specialTerms?: StringNullableWithAggregatesFilter<"Bid"> | string | null
    status?: EnumBidStatusWithAggregatesFilter<"Bid"> | $Enums.BidStatus
    priorityScore?: IntWithAggregatesFilter<"Bid"> | number
    isTemplate?: BoolWithAggregatesFilter<"Bid"> | boolean
    templateName?: StringNullableWithAggregatesFilter<"Bid"> | string | null
    bidFee?: DecimalWithAggregatesFilter<"Bid"> | Decimal | DecimalJsLike | number | string
    feePaid?: BoolWithAggregatesFilter<"Bid"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Bid"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Bid"> | Date | string
    expiresAt?: DateTimeNullableWithAggregatesFilter<"Bid"> | Date | string | null
    acceptedAt?: DateTimeNullableWithAggregatesFilter<"Bid"> | Date | string | null
    rejectedAt?: DateTimeNullableWithAggregatesFilter<"Bid"> | Date | string | null
    withdrawnAt?: DateTimeNullableWithAggregatesFilter<"Bid"> | Date | string | null
  }

  export type BidTemplateWhereInput = {
    AND?: BidTemplateWhereInput | BidTemplateWhereInput[]
    OR?: BidTemplateWhereInput[]
    NOT?: BidTemplateWhereInput | BidTemplateWhereInput[]
    id?: UuidFilter<"BidTemplate"> | string
    merchantId?: UuidFilter<"BidTemplate"> | string
    name?: StringFilter<"BidTemplate"> | string
    description?: StringNullableFilter<"BidTemplate"> | string | null
    amountType?: EnumAmountTypeFilter<"BidTemplate"> | $Enums.AmountType
    amountPercentage?: DecimalNullableFilter<"BidTemplate"> | Decimal | DecimalJsLike | number | string | null
    fixedAmount?: DecimalNullableFilter<"BidTemplate"> | Decimal | DecimalJsLike | number | string | null
    deliveryDays?: IntNullableFilter<"BidTemplate"> | number | null
    deliveryNotes?: StringNullableFilter<"BidTemplate"> | string | null
    specialTerms?: StringNullableFilter<"BidTemplate"> | string | null
    isActive?: BoolFilter<"BidTemplate"> | boolean
    usageCount?: IntFilter<"BidTemplate"> | number
    successCount?: IntFilter<"BidTemplate"> | number
    createdAt?: DateTimeFilter<"BidTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"BidTemplate"> | Date | string
  }

  export type BidTemplateOrderByWithRelationInput = {
    id?: SortOrder
    merchantId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    amountType?: SortOrder
    amountPercentage?: SortOrderInput | SortOrder
    fixedAmount?: SortOrderInput | SortOrder
    deliveryDays?: SortOrderInput | SortOrder
    deliveryNotes?: SortOrderInput | SortOrder
    specialTerms?: SortOrderInput | SortOrder
    isActive?: SortOrder
    usageCount?: SortOrder
    successCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BidTemplateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: BidTemplateWhereInput | BidTemplateWhereInput[]
    OR?: BidTemplateWhereInput[]
    NOT?: BidTemplateWhereInput | BidTemplateWhereInput[]
    merchantId?: UuidFilter<"BidTemplate"> | string
    name?: StringFilter<"BidTemplate"> | string
    description?: StringNullableFilter<"BidTemplate"> | string | null
    amountType?: EnumAmountTypeFilter<"BidTemplate"> | $Enums.AmountType
    amountPercentage?: DecimalNullableFilter<"BidTemplate"> | Decimal | DecimalJsLike | number | string | null
    fixedAmount?: DecimalNullableFilter<"BidTemplate"> | Decimal | DecimalJsLike | number | string | null
    deliveryDays?: IntNullableFilter<"BidTemplate"> | number | null
    deliveryNotes?: StringNullableFilter<"BidTemplate"> | string | null
    specialTerms?: StringNullableFilter<"BidTemplate"> | string | null
    isActive?: BoolFilter<"BidTemplate"> | boolean
    usageCount?: IntFilter<"BidTemplate"> | number
    successCount?: IntFilter<"BidTemplate"> | number
    createdAt?: DateTimeFilter<"BidTemplate"> | Date | string
    updatedAt?: DateTimeFilter<"BidTemplate"> | Date | string
  }, "id">

  export type BidTemplateOrderByWithAggregationInput = {
    id?: SortOrder
    merchantId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    amountType?: SortOrder
    amountPercentage?: SortOrderInput | SortOrder
    fixedAmount?: SortOrderInput | SortOrder
    deliveryDays?: SortOrderInput | SortOrder
    deliveryNotes?: SortOrderInput | SortOrder
    specialTerms?: SortOrderInput | SortOrder
    isActive?: SortOrder
    usageCount?: SortOrder
    successCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: BidTemplateCountOrderByAggregateInput
    _avg?: BidTemplateAvgOrderByAggregateInput
    _max?: BidTemplateMaxOrderByAggregateInput
    _min?: BidTemplateMinOrderByAggregateInput
    _sum?: BidTemplateSumOrderByAggregateInput
  }

  export type BidTemplateScalarWhereWithAggregatesInput = {
    AND?: BidTemplateScalarWhereWithAggregatesInput | BidTemplateScalarWhereWithAggregatesInput[]
    OR?: BidTemplateScalarWhereWithAggregatesInput[]
    NOT?: BidTemplateScalarWhereWithAggregatesInput | BidTemplateScalarWhereWithAggregatesInput[]
    id?: UuidWithAggregatesFilter<"BidTemplate"> | string
    merchantId?: UuidWithAggregatesFilter<"BidTemplate"> | string
    name?: StringWithAggregatesFilter<"BidTemplate"> | string
    description?: StringNullableWithAggregatesFilter<"BidTemplate"> | string | null
    amountType?: EnumAmountTypeWithAggregatesFilter<"BidTemplate"> | $Enums.AmountType
    amountPercentage?: DecimalNullableWithAggregatesFilter<"BidTemplate"> | Decimal | DecimalJsLike | number | string | null
    fixedAmount?: DecimalNullableWithAggregatesFilter<"BidTemplate"> | Decimal | DecimalJsLike | number | string | null
    deliveryDays?: IntNullableWithAggregatesFilter<"BidTemplate"> | number | null
    deliveryNotes?: StringNullableWithAggregatesFilter<"BidTemplate"> | string | null
    specialTerms?: StringNullableWithAggregatesFilter<"BidTemplate"> | string | null
    isActive?: BoolWithAggregatesFilter<"BidTemplate"> | boolean
    usageCount?: IntWithAggregatesFilter<"BidTemplate"> | number
    successCount?: IntWithAggregatesFilter<"BidTemplate"> | number
    createdAt?: DateTimeWithAggregatesFilter<"BidTemplate"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"BidTemplate"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    phone: string
    role?: $Enums.UserRole
    status?: $Enums.UserStatus
    phoneVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
    failedLoginAttempts?: number
    lockedUntil?: Date | string | null
    adminSubRole?: $Enums.AdminSubRole | null
    profile?: UserProfileCreateNestedOneWithoutUserInput
    authTokens?: AuthTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    phone: string
    role?: $Enums.UserRole
    status?: $Enums.UserStatus
    phoneVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
    failedLoginAttempts?: number
    lockedUntil?: Date | string | null
    adminSubRole?: $Enums.AdminSubRole | null
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    authTokens?: AuthTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    phoneVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adminSubRole?: NullableEnumAdminSubRoleFieldUpdateOperationsInput | $Enums.AdminSubRole | null
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    authTokens?: AuthTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    phoneVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adminSubRole?: NullableEnumAdminSubRoleFieldUpdateOperationsInput | $Enums.AdminSubRole | null
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    authTokens?: AuthTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    phone: string
    role?: $Enums.UserRole
    status?: $Enums.UserStatus
    phoneVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
    failedLoginAttempts?: number
    lockedUntil?: Date | string | null
    adminSubRole?: $Enums.AdminSubRole | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    phoneVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adminSubRole?: NullableEnumAdminSubRoleFieldUpdateOperationsInput | $Enums.AdminSubRole | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    phoneVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adminSubRole?: NullableEnumAdminSubRoleFieldUpdateOperationsInput | $Enums.AdminSubRole | null
  }

  export type UserProfileCreateInput = {
    id?: string
    firstName?: string
    lastName?: string
    profileImageUrl?: string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    address?: string | null
    city?: string | null
    country?: string | null
    preferences?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutProfileInput
  }

  export type UserProfileUncheckedCreateInput = {
    id?: string
    userId: string
    firstName?: string
    lastName?: string
    profileImageUrl?: string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    address?: string | null
    city?: string | null
    country?: string | null
    preferences?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    profileImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    preferences?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutProfileNestedInput
  }

  export type UserProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    profileImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    preferences?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProfileCreateManyInput = {
    id?: string
    userId: string
    firstName?: string
    lastName?: string
    profileImageUrl?: string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    address?: string | null
    city?: string | null
    country?: string | null
    preferences?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    profileImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    preferences?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    profileImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    preferences?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthTokenCreateInput = {
    id?: string
    tokenType: $Enums.TokenType
    tokenHash: string
    deviceFingerprint?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    expiresAt: Date | string
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    revokedAt?: Date | string | null
    user: UserCreateNestedOneWithoutAuthTokensInput
  }

  export type AuthTokenUncheckedCreateInput = {
    id?: string
    userId: string
    tokenType: $Enums.TokenType
    tokenHash: string
    deviceFingerprint?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    expiresAt: Date | string
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    revokedAt?: Date | string | null
  }

  export type AuthTokenUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenType?: EnumTokenTypeFieldUpdateOperationsInput | $Enums.TokenType
    tokenHash?: StringFieldUpdateOperationsInput | string
    deviceFingerprint?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    user?: UserUpdateOneRequiredWithoutAuthTokensNestedInput
  }

  export type AuthTokenUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    tokenType?: EnumTokenTypeFieldUpdateOperationsInput | $Enums.TokenType
    tokenHash?: StringFieldUpdateOperationsInput | string
    deviceFingerprint?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AuthTokenCreateManyInput = {
    id?: string
    userId: string
    tokenType: $Enums.TokenType
    tokenHash: string
    deviceFingerprint?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    expiresAt: Date | string
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    revokedAt?: Date | string | null
  }

  export type AuthTokenUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenType?: EnumTokenTypeFieldUpdateOperationsInput | $Enums.TokenType
    tokenHash?: StringFieldUpdateOperationsInput | string
    deviceFingerprint?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AuthTokenUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    tokenType?: EnumTokenTypeFieldUpdateOperationsInput | $Enums.TokenType
    tokenHash?: StringFieldUpdateOperationsInput | string
    deviceFingerprint?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RequestCategoryCreateInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    iconUrl?: string | null
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: RequestCategoryCreateNestedOneWithoutChildrenInput
    children?: RequestCategoryCreateNestedManyWithoutParentInput
    requests?: RequestCreateNestedManyWithoutCategoryInput
    drafts?: RequestDraftCreateNestedManyWithoutCategoryInput
  }

  export type RequestCategoryUncheckedCreateInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    parentId?: string | null
    iconUrl?: string | null
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: RequestCategoryUncheckedCreateNestedManyWithoutParentInput
    requests?: RequestUncheckedCreateNestedManyWithoutCategoryInput
    drafts?: RequestDraftUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type RequestCategoryUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: RequestCategoryUpdateOneWithoutChildrenNestedInput
    children?: RequestCategoryUpdateManyWithoutParentNestedInput
    requests?: RequestUpdateManyWithoutCategoryNestedInput
    drafts?: RequestDraftUpdateManyWithoutCategoryNestedInput
  }

  export type RequestCategoryUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: RequestCategoryUncheckedUpdateManyWithoutParentNestedInput
    requests?: RequestUncheckedUpdateManyWithoutCategoryNestedInput
    drafts?: RequestDraftUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type RequestCategoryCreateManyInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    parentId?: string | null
    iconUrl?: string | null
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RequestCategoryUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestCategoryUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestCreateInput = {
    id?: string
    buyerId: string
    title: string
    description: string
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    locationCity?: string | null
    locationCountry?: string | null
    status?: $Enums.RequestStatus
    priorityScore?: number
    bidCount?: number
    viewCount?: number
    expiresAt?: Date | string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category: RequestCategoryCreateNestedOneWithoutRequestsInput
    images?: RequestImageCreateNestedManyWithoutRequestInput
    extensions?: RequestExtensionCreateNestedManyWithoutRequestInput
    searchIndex?: RequestSearchIndexCreateNestedOneWithoutRequestInput
  }

  export type RequestUncheckedCreateInput = {
    id?: string
    buyerId: string
    categoryId: string
    title: string
    description: string
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    locationCity?: string | null
    locationCountry?: string | null
    status?: $Enums.RequestStatus
    priorityScore?: number
    bidCount?: number
    viewCount?: number
    expiresAt?: Date | string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: RequestImageUncheckedCreateNestedManyWithoutRequestInput
    extensions?: RequestExtensionUncheckedCreateNestedManyWithoutRequestInput
    searchIndex?: RequestSearchIndexUncheckedCreateNestedOneWithoutRequestInput
  }

  export type RequestUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    locationCity?: NullableStringFieldUpdateOperationsInput | string | null
    locationCountry?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    bidCount?: IntFieldUpdateOperationsInput | number
    viewCount?: IntFieldUpdateOperationsInput | number
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: RequestCategoryUpdateOneRequiredWithoutRequestsNestedInput
    images?: RequestImageUpdateManyWithoutRequestNestedInput
    extensions?: RequestExtensionUpdateManyWithoutRequestNestedInput
    searchIndex?: RequestSearchIndexUpdateOneWithoutRequestNestedInput
  }

  export type RequestUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    locationCity?: NullableStringFieldUpdateOperationsInput | string | null
    locationCountry?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    bidCount?: IntFieldUpdateOperationsInput | number
    viewCount?: IntFieldUpdateOperationsInput | number
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: RequestImageUncheckedUpdateManyWithoutRequestNestedInput
    extensions?: RequestExtensionUncheckedUpdateManyWithoutRequestNestedInput
    searchIndex?: RequestSearchIndexUncheckedUpdateOneWithoutRequestNestedInput
  }

  export type RequestCreateManyInput = {
    id?: string
    buyerId: string
    categoryId: string
    title: string
    description: string
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    locationCity?: string | null
    locationCountry?: string | null
    status?: $Enums.RequestStatus
    priorityScore?: number
    bidCount?: number
    viewCount?: number
    expiresAt?: Date | string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RequestUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    locationCity?: NullableStringFieldUpdateOperationsInput | string | null
    locationCountry?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    bidCount?: IntFieldUpdateOperationsInput | number
    viewCount?: IntFieldUpdateOperationsInput | number
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    locationCity?: NullableStringFieldUpdateOperationsInput | string | null
    locationCountry?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    bidCount?: IntFieldUpdateOperationsInput | number
    viewCount?: IntFieldUpdateOperationsInput | number
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestImageCreateInput = {
    id?: string
    imageUrl: string
    thumbnailUrl?: string | null
    originalFilename?: string | null
    fileSize: bigint | number
    mimeType: string
    width?: number | null
    height?: number | null
    sortOrder?: number
    isPrimary?: boolean
    createdAt?: Date | string
    request: RequestCreateNestedOneWithoutImagesInput
  }

  export type RequestImageUncheckedCreateInput = {
    id?: string
    requestId: string
    imageUrl: string
    thumbnailUrl?: string | null
    originalFilename?: string | null
    fileSize: bigint | number
    mimeType: string
    width?: number | null
    height?: number | null
    sortOrder?: number
    isPrimary?: boolean
    createdAt?: Date | string
  }

  export type RequestImageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    fileSize?: BigIntFieldUpdateOperationsInput | bigint | number
    mimeType?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    request?: RequestUpdateOneRequiredWithoutImagesNestedInput
  }

  export type RequestImageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    requestId?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    fileSize?: BigIntFieldUpdateOperationsInput | bigint | number
    mimeType?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestImageCreateManyInput = {
    id?: string
    requestId: string
    imageUrl: string
    thumbnailUrl?: string | null
    originalFilename?: string | null
    fileSize: bigint | number
    mimeType: string
    width?: number | null
    height?: number | null
    sortOrder?: number
    isPrimary?: boolean
    createdAt?: Date | string
  }

  export type RequestImageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    fileSize?: BigIntFieldUpdateOperationsInput | bigint | number
    mimeType?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestImageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    requestId?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    fileSize?: BigIntFieldUpdateOperationsInput | bigint | number
    mimeType?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestDraftCreateInput = {
    id?: string
    buyerId: string
    title?: string | null
    description?: string | null
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    autoSaveData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    category?: RequestCategoryCreateNestedOneWithoutDraftsInput
  }

  export type RequestDraftUncheckedCreateInput = {
    id?: string
    buyerId: string
    categoryId?: string | null
    title?: string | null
    description?: string | null
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    autoSaveData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RequestDraftUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    autoSaveData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: RequestCategoryUpdateOneWithoutDraftsNestedInput
  }

  export type RequestDraftUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    autoSaveData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestDraftCreateManyInput = {
    id?: string
    buyerId: string
    categoryId?: string | null
    title?: string | null
    description?: string | null
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    autoSaveData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RequestDraftUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    autoSaveData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestDraftUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    categoryId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    autoSaveData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestExtensionCreateInput = {
    id?: string
    originalExpiresAt: Date | string
    newExpiresAt: Date | string
    extensionReason?: string | null
    extendedBy?: string | null
    createdAt?: Date | string
    request: RequestCreateNestedOneWithoutExtensionsInput
  }

  export type RequestExtensionUncheckedCreateInput = {
    id?: string
    requestId: string
    originalExpiresAt: Date | string
    newExpiresAt: Date | string
    extensionReason?: string | null
    extendedBy?: string | null
    createdAt?: Date | string
  }

  export type RequestExtensionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    originalExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    newExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    extensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    extendedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    request?: RequestUpdateOneRequiredWithoutExtensionsNestedInput
  }

  export type RequestExtensionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    requestId?: StringFieldUpdateOperationsInput | string
    originalExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    newExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    extensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    extendedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestExtensionCreateManyInput = {
    id?: string
    requestId: string
    originalExpiresAt: Date | string
    newExpiresAt: Date | string
    extensionReason?: string | null
    extendedBy?: string | null
    createdAt?: Date | string
  }

  export type RequestExtensionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    originalExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    newExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    extensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    extendedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestExtensionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    requestId?: StringFieldUpdateOperationsInput | string
    originalExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    newExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    extensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    extendedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestSearchIndexCreateInput = {
    id?: string
    searchVector?: string | null
    categoryPath?: string | null
    locationText?: string | null
    budgetRange?: string | null
    createdAt?: Date | string
    request: RequestCreateNestedOneWithoutSearchIndexInput
  }

  export type RequestSearchIndexUncheckedCreateInput = {
    id?: string
    requestId: string
    searchVector?: string | null
    categoryPath?: string | null
    locationText?: string | null
    budgetRange?: string | null
    createdAt?: Date | string
  }

  export type RequestSearchIndexUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    searchVector?: NullableStringFieldUpdateOperationsInput | string | null
    categoryPath?: NullableStringFieldUpdateOperationsInput | string | null
    locationText?: NullableStringFieldUpdateOperationsInput | string | null
    budgetRange?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    request?: RequestUpdateOneRequiredWithoutSearchIndexNestedInput
  }

  export type RequestSearchIndexUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    requestId?: StringFieldUpdateOperationsInput | string
    searchVector?: NullableStringFieldUpdateOperationsInput | string | null
    categoryPath?: NullableStringFieldUpdateOperationsInput | string | null
    locationText?: NullableStringFieldUpdateOperationsInput | string | null
    budgetRange?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestSearchIndexCreateManyInput = {
    id?: string
    requestId: string
    searchVector?: string | null
    categoryPath?: string | null
    locationText?: string | null
    budgetRange?: string | null
    createdAt?: Date | string
  }

  export type RequestSearchIndexUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    searchVector?: NullableStringFieldUpdateOperationsInput | string | null
    categoryPath?: NullableStringFieldUpdateOperationsInput | string | null
    locationText?: NullableStringFieldUpdateOperationsInput | string | null
    budgetRange?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestSearchIndexUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    requestId?: StringFieldUpdateOperationsInput | string
    searchVector?: NullableStringFieldUpdateOperationsInput | string | null
    categoryPath?: NullableStringFieldUpdateOperationsInput | string | null
    locationText?: NullableStringFieldUpdateOperationsInput | string | null
    budgetRange?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SavedSearchCreateInput = {
    id?: string
    userId: string
    name: string
    searchCriteria: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SavedSearchUncheckedCreateInput = {
    id?: string
    userId: string
    name: string
    searchCriteria: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SavedSearchUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    searchCriteria?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SavedSearchUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    searchCriteria?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SavedSearchCreateManyInput = {
    id?: string
    userId: string
    name: string
    searchCriteria: JsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SavedSearchUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    searchCriteria?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SavedSearchUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    searchCriteria?: JsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BidCreateInput = {
    id?: string
    requestId: string
    merchantId: string
    amount: Decimal | DecimalJsLike | number | string
    deliveryDays: number
    deliveryNotes?: string | null
    specialTerms?: string | null
    status?: $Enums.BidStatus
    priorityScore?: number
    isTemplate?: boolean
    templateName?: string | null
    bidFee?: Decimal | DecimalJsLike | number | string
    feePaid?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    expiresAt?: Date | string | null
    acceptedAt?: Date | string | null
    rejectedAt?: Date | string | null
    withdrawnAt?: Date | string | null
  }

  export type BidUncheckedCreateInput = {
    id?: string
    requestId: string
    merchantId: string
    amount: Decimal | DecimalJsLike | number | string
    deliveryDays: number
    deliveryNotes?: string | null
    specialTerms?: string | null
    status?: $Enums.BidStatus
    priorityScore?: number
    isTemplate?: boolean
    templateName?: string | null
    bidFee?: Decimal | DecimalJsLike | number | string
    feePaid?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    expiresAt?: Date | string | null
    acceptedAt?: Date | string | null
    rejectedAt?: Date | string | null
    withdrawnAt?: Date | string | null
  }

  export type BidUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    requestId?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deliveryDays?: IntFieldUpdateOperationsInput | number
    deliveryNotes?: NullableStringFieldUpdateOperationsInput | string | null
    specialTerms?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBidStatusFieldUpdateOperationsInput | $Enums.BidStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    isTemplate?: BoolFieldUpdateOperationsInput | boolean
    templateName?: NullableStringFieldUpdateOperationsInput | string | null
    bidFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feePaid?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    withdrawnAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BidUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    requestId?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deliveryDays?: IntFieldUpdateOperationsInput | number
    deliveryNotes?: NullableStringFieldUpdateOperationsInput | string | null
    specialTerms?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBidStatusFieldUpdateOperationsInput | $Enums.BidStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    isTemplate?: BoolFieldUpdateOperationsInput | boolean
    templateName?: NullableStringFieldUpdateOperationsInput | string | null
    bidFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feePaid?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    withdrawnAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BidCreateManyInput = {
    id?: string
    requestId: string
    merchantId: string
    amount: Decimal | DecimalJsLike | number | string
    deliveryDays: number
    deliveryNotes?: string | null
    specialTerms?: string | null
    status?: $Enums.BidStatus
    priorityScore?: number
    isTemplate?: boolean
    templateName?: string | null
    bidFee?: Decimal | DecimalJsLike | number | string
    feePaid?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    expiresAt?: Date | string | null
    acceptedAt?: Date | string | null
    rejectedAt?: Date | string | null
    withdrawnAt?: Date | string | null
  }

  export type BidUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    requestId?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deliveryDays?: IntFieldUpdateOperationsInput | number
    deliveryNotes?: NullableStringFieldUpdateOperationsInput | string | null
    specialTerms?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBidStatusFieldUpdateOperationsInput | $Enums.BidStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    isTemplate?: BoolFieldUpdateOperationsInput | boolean
    templateName?: NullableStringFieldUpdateOperationsInput | string | null
    bidFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feePaid?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    withdrawnAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BidUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    requestId?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    amount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    deliveryDays?: IntFieldUpdateOperationsInput | number
    deliveryNotes?: NullableStringFieldUpdateOperationsInput | string | null
    specialTerms?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumBidStatusFieldUpdateOperationsInput | $Enums.BidStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    isTemplate?: BoolFieldUpdateOperationsInput | boolean
    templateName?: NullableStringFieldUpdateOperationsInput | string | null
    bidFee?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    feePaid?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    acceptedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    rejectedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    withdrawnAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type BidTemplateCreateInput = {
    id?: string
    merchantId: string
    name: string
    description?: string | null
    amountType?: $Enums.AmountType
    amountPercentage?: Decimal | DecimalJsLike | number | string | null
    fixedAmount?: Decimal | DecimalJsLike | number | string | null
    deliveryDays?: number | null
    deliveryNotes?: string | null
    specialTerms?: string | null
    isActive?: boolean
    usageCount?: number
    successCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BidTemplateUncheckedCreateInput = {
    id?: string
    merchantId: string
    name: string
    description?: string | null
    amountType?: $Enums.AmountType
    amountPercentage?: Decimal | DecimalJsLike | number | string | null
    fixedAmount?: Decimal | DecimalJsLike | number | string | null
    deliveryDays?: number | null
    deliveryNotes?: string | null
    specialTerms?: string | null
    isActive?: boolean
    usageCount?: number
    successCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BidTemplateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    amountType?: EnumAmountTypeFieldUpdateOperationsInput | $Enums.AmountType
    amountPercentage?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    fixedAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryNotes?: NullableStringFieldUpdateOperationsInput | string | null
    specialTerms?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    usageCount?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BidTemplateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    amountType?: EnumAmountTypeFieldUpdateOperationsInput | $Enums.AmountType
    amountPercentage?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    fixedAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryNotes?: NullableStringFieldUpdateOperationsInput | string | null
    specialTerms?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    usageCount?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BidTemplateCreateManyInput = {
    id?: string
    merchantId: string
    name: string
    description?: string | null
    amountType?: $Enums.AmountType
    amountPercentage?: Decimal | DecimalJsLike | number | string | null
    fixedAmount?: Decimal | DecimalJsLike | number | string | null
    deliveryDays?: number | null
    deliveryNotes?: string | null
    specialTerms?: string | null
    isActive?: boolean
    usageCount?: number
    successCount?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type BidTemplateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    amountType?: EnumAmountTypeFieldUpdateOperationsInput | $Enums.AmountType
    amountPercentage?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    fixedAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryNotes?: NullableStringFieldUpdateOperationsInput | string | null
    specialTerms?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    usageCount?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BidTemplateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    merchantId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    amountType?: EnumAmountTypeFieldUpdateOperationsInput | $Enums.AmountType
    amountPercentage?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    fixedAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    deliveryDays?: NullableIntFieldUpdateOperationsInput | number | null
    deliveryNotes?: NullableStringFieldUpdateOperationsInput | string | null
    specialTerms?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    usageCount?: IntFieldUpdateOperationsInput | number
    successCount?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type EnumUserStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusFilter<$PrismaModel> | $Enums.UserStatus
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumAdminSubRoleNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.AdminSubRole | EnumAdminSubRoleFieldRefInput<$PrismaModel> | null
    in?: $Enums.AdminSubRole[] | ListEnumAdminSubRoleFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.AdminSubRole[] | ListEnumAdminSubRoleFieldRefInput<$PrismaModel> | null
    not?: NestedEnumAdminSubRoleNullableFilter<$PrismaModel> | $Enums.AdminSubRole | null
  }

  export type UserProfileNullableRelationFilter = {
    is?: UserProfileWhereInput | null
    isNot?: UserProfileWhereInput | null
  }

  export type AuthTokenListRelationFilter = {
    every?: AuthTokenWhereInput
    some?: AuthTokenWhereInput
    none?: AuthTokenWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type AuthTokenOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    phone?: SortOrder
    role?: SortOrder
    status?: SortOrder
    phoneVerified?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrder
    failedLoginAttempts?: SortOrder
    lockedUntil?: SortOrder
    adminSubRole?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    failedLoginAttempts?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    phone?: SortOrder
    role?: SortOrder
    status?: SortOrder
    phoneVerified?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrder
    failedLoginAttempts?: SortOrder
    lockedUntil?: SortOrder
    adminSubRole?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    phone?: SortOrder
    role?: SortOrder
    status?: SortOrder
    phoneVerified?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    lastLoginAt?: SortOrder
    failedLoginAttempts?: SortOrder
    lockedUntil?: SortOrder
    adminSubRole?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    failedLoginAttempts?: SortOrder
  }

  export type UuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type EnumUserStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusWithAggregatesFilter<$PrismaModel> | $Enums.UserStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserStatusFilter<$PrismaModel>
    _max?: NestedEnumUserStatusFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumAdminSubRoleNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AdminSubRole | EnumAdminSubRoleFieldRefInput<$PrismaModel> | null
    in?: $Enums.AdminSubRole[] | ListEnumAdminSubRoleFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.AdminSubRole[] | ListEnumAdminSubRoleFieldRefInput<$PrismaModel> | null
    not?: NestedEnumAdminSubRoleNullableWithAggregatesFilter<$PrismaModel> | $Enums.AdminSubRole | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumAdminSubRoleNullableFilter<$PrismaModel>
    _max?: NestedEnumAdminSubRoleNullableFilter<$PrismaModel>
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type UserProfileCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    profileImageUrl?: SortOrder
    locationLat?: SortOrder
    locationLng?: SortOrder
    address?: SortOrder
    city?: SortOrder
    country?: SortOrder
    preferences?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserProfileAvgOrderByAggregateInput = {
    locationLat?: SortOrder
    locationLng?: SortOrder
  }

  export type UserProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    profileImageUrl?: SortOrder
    locationLat?: SortOrder
    locationLng?: SortOrder
    address?: SortOrder
    city?: SortOrder
    country?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserProfileMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    profileImageUrl?: SortOrder
    locationLat?: SortOrder
    locationLng?: SortOrder
    address?: SortOrder
    city?: SortOrder
    country?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserProfileSumOrderByAggregateInput = {
    locationLat?: SortOrder
    locationLng?: SortOrder
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type EnumTokenTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TokenType | EnumTokenTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TokenType[] | ListEnumTokenTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TokenType[] | ListEnumTokenTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTokenTypeFilter<$PrismaModel> | $Enums.TokenType
  }

  export type AuthTokenCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenType?: SortOrder
    tokenHash?: SortOrder
    deviceFingerprint?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    expiresAt?: SortOrder
    lastUsedAt?: SortOrder
    createdAt?: SortOrder
    revokedAt?: SortOrder
  }

  export type AuthTokenMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenType?: SortOrder
    tokenHash?: SortOrder
    deviceFingerprint?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    expiresAt?: SortOrder
    lastUsedAt?: SortOrder
    createdAt?: SortOrder
    revokedAt?: SortOrder
  }

  export type AuthTokenMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    tokenType?: SortOrder
    tokenHash?: SortOrder
    deviceFingerprint?: SortOrder
    ipAddress?: SortOrder
    userAgent?: SortOrder
    expiresAt?: SortOrder
    lastUsedAt?: SortOrder
    createdAt?: SortOrder
    revokedAt?: SortOrder
  }

  export type EnumTokenTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TokenType | EnumTokenTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TokenType[] | ListEnumTokenTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TokenType[] | ListEnumTokenTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTokenTypeWithAggregatesFilter<$PrismaModel> | $Enums.TokenType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTokenTypeFilter<$PrismaModel>
    _max?: NestedEnumTokenTypeFilter<$PrismaModel>
  }

  export type UuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type RequestCategoryNullableRelationFilter = {
    is?: RequestCategoryWhereInput | null
    isNot?: RequestCategoryWhereInput | null
  }

  export type RequestCategoryListRelationFilter = {
    every?: RequestCategoryWhereInput
    some?: RequestCategoryWhereInput
    none?: RequestCategoryWhereInput
  }

  export type RequestListRelationFilter = {
    every?: RequestWhereInput
    some?: RequestWhereInput
    none?: RequestWhereInput
  }

  export type RequestDraftListRelationFilter = {
    every?: RequestDraftWhereInput
    some?: RequestDraftWhereInput
    none?: RequestDraftWhereInput
  }

  export type RequestCategoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RequestOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RequestDraftOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RequestCategoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    parentId?: SortOrder
    iconUrl?: SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RequestCategoryAvgOrderByAggregateInput = {
    sortOrder?: SortOrder
  }

  export type RequestCategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    parentId?: SortOrder
    iconUrl?: SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RequestCategoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    slug?: SortOrder
    description?: SortOrder
    parentId?: SortOrder
    iconUrl?: SortOrder
    isActive?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RequestCategorySumOrderByAggregateInput = {
    sortOrder?: SortOrder
  }

  export type UuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumRequestStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RequestStatus | EnumRequestStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRequestStatusFilter<$PrismaModel> | $Enums.RequestStatus
  }

  export type RequestCategoryRelationFilter = {
    is?: RequestCategoryWhereInput
    isNot?: RequestCategoryWhereInput
  }

  export type RequestImageListRelationFilter = {
    every?: RequestImageWhereInput
    some?: RequestImageWhereInput
    none?: RequestImageWhereInput
  }

  export type RequestExtensionListRelationFilter = {
    every?: RequestExtensionWhereInput
    some?: RequestExtensionWhereInput
    none?: RequestExtensionWhereInput
  }

  export type RequestSearchIndexNullableRelationFilter = {
    is?: RequestSearchIndexWhereInput | null
    isNot?: RequestSearchIndexWhereInput | null
  }

  export type RequestImageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RequestExtensionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RequestCountOrderByAggregateInput = {
    id?: SortOrder
    buyerId?: SortOrder
    categoryId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    budgetMin?: SortOrder
    budgetMax?: SortOrder
    locationLat?: SortOrder
    locationLng?: SortOrder
    locationAddress?: SortOrder
    locationCity?: SortOrder
    locationCountry?: SortOrder
    status?: SortOrder
    priorityScore?: SortOrder
    bidCount?: SortOrder
    viewCount?: SortOrder
    expiresAt?: SortOrder
    publishedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RequestAvgOrderByAggregateInput = {
    budgetMin?: SortOrder
    budgetMax?: SortOrder
    locationLat?: SortOrder
    locationLng?: SortOrder
    priorityScore?: SortOrder
    bidCount?: SortOrder
    viewCount?: SortOrder
  }

  export type RequestMaxOrderByAggregateInput = {
    id?: SortOrder
    buyerId?: SortOrder
    categoryId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    budgetMin?: SortOrder
    budgetMax?: SortOrder
    locationLat?: SortOrder
    locationLng?: SortOrder
    locationAddress?: SortOrder
    locationCity?: SortOrder
    locationCountry?: SortOrder
    status?: SortOrder
    priorityScore?: SortOrder
    bidCount?: SortOrder
    viewCount?: SortOrder
    expiresAt?: SortOrder
    publishedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RequestMinOrderByAggregateInput = {
    id?: SortOrder
    buyerId?: SortOrder
    categoryId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    budgetMin?: SortOrder
    budgetMax?: SortOrder
    locationLat?: SortOrder
    locationLng?: SortOrder
    locationAddress?: SortOrder
    locationCity?: SortOrder
    locationCountry?: SortOrder
    status?: SortOrder
    priorityScore?: SortOrder
    bidCount?: SortOrder
    viewCount?: SortOrder
    expiresAt?: SortOrder
    publishedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RequestSumOrderByAggregateInput = {
    budgetMin?: SortOrder
    budgetMax?: SortOrder
    locationLat?: SortOrder
    locationLng?: SortOrder
    priorityScore?: SortOrder
    bidCount?: SortOrder
    viewCount?: SortOrder
  }

  export type EnumRequestStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RequestStatus | EnumRequestStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRequestStatusWithAggregatesFilter<$PrismaModel> | $Enums.RequestStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRequestStatusFilter<$PrismaModel>
    _max?: NestedEnumRequestStatusFilter<$PrismaModel>
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type RequestRelationFilter = {
    is?: RequestWhereInput
    isNot?: RequestWhereInput
  }

  export type RequestImageCountOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    imageUrl?: SortOrder
    thumbnailUrl?: SortOrder
    originalFilename?: SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    width?: SortOrder
    height?: SortOrder
    sortOrder?: SortOrder
    isPrimary?: SortOrder
    createdAt?: SortOrder
  }

  export type RequestImageAvgOrderByAggregateInput = {
    fileSize?: SortOrder
    width?: SortOrder
    height?: SortOrder
    sortOrder?: SortOrder
  }

  export type RequestImageMaxOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    imageUrl?: SortOrder
    thumbnailUrl?: SortOrder
    originalFilename?: SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    width?: SortOrder
    height?: SortOrder
    sortOrder?: SortOrder
    isPrimary?: SortOrder
    createdAt?: SortOrder
  }

  export type RequestImageMinOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    imageUrl?: SortOrder
    thumbnailUrl?: SortOrder
    originalFilename?: SortOrder
    fileSize?: SortOrder
    mimeType?: SortOrder
    width?: SortOrder
    height?: SortOrder
    sortOrder?: SortOrder
    isPrimary?: SortOrder
    createdAt?: SortOrder
  }

  export type RequestImageSumOrderByAggregateInput = {
    fileSize?: SortOrder
    width?: SortOrder
    height?: SortOrder
    sortOrder?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type RequestDraftCountOrderByAggregateInput = {
    id?: SortOrder
    buyerId?: SortOrder
    categoryId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    budgetMin?: SortOrder
    budgetMax?: SortOrder
    locationLat?: SortOrder
    locationLng?: SortOrder
    locationAddress?: SortOrder
    autoSaveData?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RequestDraftAvgOrderByAggregateInput = {
    budgetMin?: SortOrder
    budgetMax?: SortOrder
    locationLat?: SortOrder
    locationLng?: SortOrder
  }

  export type RequestDraftMaxOrderByAggregateInput = {
    id?: SortOrder
    buyerId?: SortOrder
    categoryId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    budgetMin?: SortOrder
    budgetMax?: SortOrder
    locationLat?: SortOrder
    locationLng?: SortOrder
    locationAddress?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RequestDraftMinOrderByAggregateInput = {
    id?: SortOrder
    buyerId?: SortOrder
    categoryId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    budgetMin?: SortOrder
    budgetMax?: SortOrder
    locationLat?: SortOrder
    locationLng?: SortOrder
    locationAddress?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type RequestDraftSumOrderByAggregateInput = {
    budgetMin?: SortOrder
    budgetMax?: SortOrder
    locationLat?: SortOrder
    locationLng?: SortOrder
  }

  export type RequestExtensionCountOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    originalExpiresAt?: SortOrder
    newExpiresAt?: SortOrder
    extensionReason?: SortOrder
    extendedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type RequestExtensionMaxOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    originalExpiresAt?: SortOrder
    newExpiresAt?: SortOrder
    extensionReason?: SortOrder
    extendedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type RequestExtensionMinOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    originalExpiresAt?: SortOrder
    newExpiresAt?: SortOrder
    extensionReason?: SortOrder
    extendedBy?: SortOrder
    createdAt?: SortOrder
  }

  export type RequestSearchIndexCountOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    searchVector?: SortOrder
    categoryPath?: SortOrder
    locationText?: SortOrder
    budgetRange?: SortOrder
    createdAt?: SortOrder
  }

  export type RequestSearchIndexMaxOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    searchVector?: SortOrder
    categoryPath?: SortOrder
    locationText?: SortOrder
    budgetRange?: SortOrder
    createdAt?: SortOrder
  }

  export type RequestSearchIndexMinOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    searchVector?: SortOrder
    categoryPath?: SortOrder
    locationText?: SortOrder
    budgetRange?: SortOrder
    createdAt?: SortOrder
  }

  export type SavedSearchCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    searchCriteria?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SavedSearchMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SavedSearchMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    name?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type EnumBidStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BidStatus | EnumBidStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBidStatusFilter<$PrismaModel> | $Enums.BidStatus
  }

  export type BidRequestIdMerchantIdCompoundUniqueInput = {
    requestId: string
    merchantId: string
  }

  export type BidCountOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    merchantId?: SortOrder
    amount?: SortOrder
    deliveryDays?: SortOrder
    deliveryNotes?: SortOrder
    specialTerms?: SortOrder
    status?: SortOrder
    priorityScore?: SortOrder
    isTemplate?: SortOrder
    templateName?: SortOrder
    bidFee?: SortOrder
    feePaid?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    expiresAt?: SortOrder
    acceptedAt?: SortOrder
    rejectedAt?: SortOrder
    withdrawnAt?: SortOrder
  }

  export type BidAvgOrderByAggregateInput = {
    amount?: SortOrder
    deliveryDays?: SortOrder
    priorityScore?: SortOrder
    bidFee?: SortOrder
  }

  export type BidMaxOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    merchantId?: SortOrder
    amount?: SortOrder
    deliveryDays?: SortOrder
    deliveryNotes?: SortOrder
    specialTerms?: SortOrder
    status?: SortOrder
    priorityScore?: SortOrder
    isTemplate?: SortOrder
    templateName?: SortOrder
    bidFee?: SortOrder
    feePaid?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    expiresAt?: SortOrder
    acceptedAt?: SortOrder
    rejectedAt?: SortOrder
    withdrawnAt?: SortOrder
  }

  export type BidMinOrderByAggregateInput = {
    id?: SortOrder
    requestId?: SortOrder
    merchantId?: SortOrder
    amount?: SortOrder
    deliveryDays?: SortOrder
    deliveryNotes?: SortOrder
    specialTerms?: SortOrder
    status?: SortOrder
    priorityScore?: SortOrder
    isTemplate?: SortOrder
    templateName?: SortOrder
    bidFee?: SortOrder
    feePaid?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    expiresAt?: SortOrder
    acceptedAt?: SortOrder
    rejectedAt?: SortOrder
    withdrawnAt?: SortOrder
  }

  export type BidSumOrderByAggregateInput = {
    amount?: SortOrder
    deliveryDays?: SortOrder
    priorityScore?: SortOrder
    bidFee?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type EnumBidStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BidStatus | EnumBidStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBidStatusWithAggregatesFilter<$PrismaModel> | $Enums.BidStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBidStatusFilter<$PrismaModel>
    _max?: NestedEnumBidStatusFilter<$PrismaModel>
  }

  export type EnumAmountTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AmountType | EnumAmountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AmountType[] | ListEnumAmountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AmountType[] | ListEnumAmountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAmountTypeFilter<$PrismaModel> | $Enums.AmountType
  }

  export type BidTemplateCountOrderByAggregateInput = {
    id?: SortOrder
    merchantId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    amountType?: SortOrder
    amountPercentage?: SortOrder
    fixedAmount?: SortOrder
    deliveryDays?: SortOrder
    deliveryNotes?: SortOrder
    specialTerms?: SortOrder
    isActive?: SortOrder
    usageCount?: SortOrder
    successCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BidTemplateAvgOrderByAggregateInput = {
    amountPercentage?: SortOrder
    fixedAmount?: SortOrder
    deliveryDays?: SortOrder
    usageCount?: SortOrder
    successCount?: SortOrder
  }

  export type BidTemplateMaxOrderByAggregateInput = {
    id?: SortOrder
    merchantId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    amountType?: SortOrder
    amountPercentage?: SortOrder
    fixedAmount?: SortOrder
    deliveryDays?: SortOrder
    deliveryNotes?: SortOrder
    specialTerms?: SortOrder
    isActive?: SortOrder
    usageCount?: SortOrder
    successCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BidTemplateMinOrderByAggregateInput = {
    id?: SortOrder
    merchantId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    amountType?: SortOrder
    amountPercentage?: SortOrder
    fixedAmount?: SortOrder
    deliveryDays?: SortOrder
    deliveryNotes?: SortOrder
    specialTerms?: SortOrder
    isActive?: SortOrder
    usageCount?: SortOrder
    successCount?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BidTemplateSumOrderByAggregateInput = {
    amountPercentage?: SortOrder
    fixedAmount?: SortOrder
    deliveryDays?: SortOrder
    usageCount?: SortOrder
    successCount?: SortOrder
  }

  export type EnumAmountTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AmountType | EnumAmountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AmountType[] | ListEnumAmountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AmountType[] | ListEnumAmountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAmountTypeWithAggregatesFilter<$PrismaModel> | $Enums.AmountType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAmountTypeFilter<$PrismaModel>
    _max?: NestedEnumAmountTypeFilter<$PrismaModel>
  }

  export type UserProfileCreateNestedOneWithoutUserInput = {
    create?: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutUserInput
    connect?: UserProfileWhereUniqueInput
  }

  export type AuthTokenCreateNestedManyWithoutUserInput = {
    create?: XOR<AuthTokenCreateWithoutUserInput, AuthTokenUncheckedCreateWithoutUserInput> | AuthTokenCreateWithoutUserInput[] | AuthTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthTokenCreateOrConnectWithoutUserInput | AuthTokenCreateOrConnectWithoutUserInput[]
    createMany?: AuthTokenCreateManyUserInputEnvelope
    connect?: AuthTokenWhereUniqueInput | AuthTokenWhereUniqueInput[]
  }

  export type UserProfileUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutUserInput
    connect?: UserProfileWhereUniqueInput
  }

  export type AuthTokenUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AuthTokenCreateWithoutUserInput, AuthTokenUncheckedCreateWithoutUserInput> | AuthTokenCreateWithoutUserInput[] | AuthTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthTokenCreateOrConnectWithoutUserInput | AuthTokenCreateOrConnectWithoutUserInput[]
    createMany?: AuthTokenCreateManyUserInputEnvelope
    connect?: AuthTokenWhereUniqueInput | AuthTokenWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumUserRoleFieldUpdateOperationsInput = {
    set?: $Enums.UserRole
  }

  export type EnumUserStatusFieldUpdateOperationsInput = {
    set?: $Enums.UserStatus
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableEnumAdminSubRoleFieldUpdateOperationsInput = {
    set?: $Enums.AdminSubRole | null
  }

  export type UserProfileUpdateOneWithoutUserNestedInput = {
    create?: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutUserInput
    upsert?: UserProfileUpsertWithoutUserInput
    disconnect?: UserProfileWhereInput | boolean
    delete?: UserProfileWhereInput | boolean
    connect?: UserProfileWhereUniqueInput
    update?: XOR<XOR<UserProfileUpdateToOneWithWhereWithoutUserInput, UserProfileUpdateWithoutUserInput>, UserProfileUncheckedUpdateWithoutUserInput>
  }

  export type AuthTokenUpdateManyWithoutUserNestedInput = {
    create?: XOR<AuthTokenCreateWithoutUserInput, AuthTokenUncheckedCreateWithoutUserInput> | AuthTokenCreateWithoutUserInput[] | AuthTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthTokenCreateOrConnectWithoutUserInput | AuthTokenCreateOrConnectWithoutUserInput[]
    upsert?: AuthTokenUpsertWithWhereUniqueWithoutUserInput | AuthTokenUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AuthTokenCreateManyUserInputEnvelope
    set?: AuthTokenWhereUniqueInput | AuthTokenWhereUniqueInput[]
    disconnect?: AuthTokenWhereUniqueInput | AuthTokenWhereUniqueInput[]
    delete?: AuthTokenWhereUniqueInput | AuthTokenWhereUniqueInput[]
    connect?: AuthTokenWhereUniqueInput | AuthTokenWhereUniqueInput[]
    update?: AuthTokenUpdateWithWhereUniqueWithoutUserInput | AuthTokenUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AuthTokenUpdateManyWithWhereWithoutUserInput | AuthTokenUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AuthTokenScalarWhereInput | AuthTokenScalarWhereInput[]
  }

  export type UserProfileUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutUserInput
    upsert?: UserProfileUpsertWithoutUserInput
    disconnect?: UserProfileWhereInput | boolean
    delete?: UserProfileWhereInput | boolean
    connect?: UserProfileWhereUniqueInput
    update?: XOR<XOR<UserProfileUpdateToOneWithWhereWithoutUserInput, UserProfileUpdateWithoutUserInput>, UserProfileUncheckedUpdateWithoutUserInput>
  }

  export type AuthTokenUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AuthTokenCreateWithoutUserInput, AuthTokenUncheckedCreateWithoutUserInput> | AuthTokenCreateWithoutUserInput[] | AuthTokenUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AuthTokenCreateOrConnectWithoutUserInput | AuthTokenCreateOrConnectWithoutUserInput[]
    upsert?: AuthTokenUpsertWithWhereUniqueWithoutUserInput | AuthTokenUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AuthTokenCreateManyUserInputEnvelope
    set?: AuthTokenWhereUniqueInput | AuthTokenWhereUniqueInput[]
    disconnect?: AuthTokenWhereUniqueInput | AuthTokenWhereUniqueInput[]
    delete?: AuthTokenWhereUniqueInput | AuthTokenWhereUniqueInput[]
    connect?: AuthTokenWhereUniqueInput | AuthTokenWhereUniqueInput[]
    update?: AuthTokenUpdateWithWhereUniqueWithoutUserInput | AuthTokenUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AuthTokenUpdateManyWithWhereWithoutUserInput | AuthTokenUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AuthTokenScalarWhereInput | AuthTokenScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutProfileInput = {
    create?: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutProfileInput
    connect?: UserWhereUniqueInput
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type UserUpdateOneRequiredWithoutProfileNestedInput = {
    create?: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutProfileInput
    upsert?: UserUpsertWithoutProfileInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutProfileInput, UserUpdateWithoutProfileInput>, UserUncheckedUpdateWithoutProfileInput>
  }

  export type UserCreateNestedOneWithoutAuthTokensInput = {
    create?: XOR<UserCreateWithoutAuthTokensInput, UserUncheckedCreateWithoutAuthTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutAuthTokensInput
    connect?: UserWhereUniqueInput
  }

  export type EnumTokenTypeFieldUpdateOperationsInput = {
    set?: $Enums.TokenType
  }

  export type UserUpdateOneRequiredWithoutAuthTokensNestedInput = {
    create?: XOR<UserCreateWithoutAuthTokensInput, UserUncheckedCreateWithoutAuthTokensInput>
    connectOrCreate?: UserCreateOrConnectWithoutAuthTokensInput
    upsert?: UserUpsertWithoutAuthTokensInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutAuthTokensInput, UserUpdateWithoutAuthTokensInput>, UserUncheckedUpdateWithoutAuthTokensInput>
  }

  export type RequestCategoryCreateNestedOneWithoutChildrenInput = {
    create?: XOR<RequestCategoryCreateWithoutChildrenInput, RequestCategoryUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: RequestCategoryCreateOrConnectWithoutChildrenInput
    connect?: RequestCategoryWhereUniqueInput
  }

  export type RequestCategoryCreateNestedManyWithoutParentInput = {
    create?: XOR<RequestCategoryCreateWithoutParentInput, RequestCategoryUncheckedCreateWithoutParentInput> | RequestCategoryCreateWithoutParentInput[] | RequestCategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: RequestCategoryCreateOrConnectWithoutParentInput | RequestCategoryCreateOrConnectWithoutParentInput[]
    createMany?: RequestCategoryCreateManyParentInputEnvelope
    connect?: RequestCategoryWhereUniqueInput | RequestCategoryWhereUniqueInput[]
  }

  export type RequestCreateNestedManyWithoutCategoryInput = {
    create?: XOR<RequestCreateWithoutCategoryInput, RequestUncheckedCreateWithoutCategoryInput> | RequestCreateWithoutCategoryInput[] | RequestUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: RequestCreateOrConnectWithoutCategoryInput | RequestCreateOrConnectWithoutCategoryInput[]
    createMany?: RequestCreateManyCategoryInputEnvelope
    connect?: RequestWhereUniqueInput | RequestWhereUniqueInput[]
  }

  export type RequestDraftCreateNestedManyWithoutCategoryInput = {
    create?: XOR<RequestDraftCreateWithoutCategoryInput, RequestDraftUncheckedCreateWithoutCategoryInput> | RequestDraftCreateWithoutCategoryInput[] | RequestDraftUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: RequestDraftCreateOrConnectWithoutCategoryInput | RequestDraftCreateOrConnectWithoutCategoryInput[]
    createMany?: RequestDraftCreateManyCategoryInputEnvelope
    connect?: RequestDraftWhereUniqueInput | RequestDraftWhereUniqueInput[]
  }

  export type RequestCategoryUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<RequestCategoryCreateWithoutParentInput, RequestCategoryUncheckedCreateWithoutParentInput> | RequestCategoryCreateWithoutParentInput[] | RequestCategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: RequestCategoryCreateOrConnectWithoutParentInput | RequestCategoryCreateOrConnectWithoutParentInput[]
    createMany?: RequestCategoryCreateManyParentInputEnvelope
    connect?: RequestCategoryWhereUniqueInput | RequestCategoryWhereUniqueInput[]
  }

  export type RequestUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<RequestCreateWithoutCategoryInput, RequestUncheckedCreateWithoutCategoryInput> | RequestCreateWithoutCategoryInput[] | RequestUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: RequestCreateOrConnectWithoutCategoryInput | RequestCreateOrConnectWithoutCategoryInput[]
    createMany?: RequestCreateManyCategoryInputEnvelope
    connect?: RequestWhereUniqueInput | RequestWhereUniqueInput[]
  }

  export type RequestDraftUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<RequestDraftCreateWithoutCategoryInput, RequestDraftUncheckedCreateWithoutCategoryInput> | RequestDraftCreateWithoutCategoryInput[] | RequestDraftUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: RequestDraftCreateOrConnectWithoutCategoryInput | RequestDraftCreateOrConnectWithoutCategoryInput[]
    createMany?: RequestDraftCreateManyCategoryInputEnvelope
    connect?: RequestDraftWhereUniqueInput | RequestDraftWhereUniqueInput[]
  }

  export type RequestCategoryUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<RequestCategoryCreateWithoutChildrenInput, RequestCategoryUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: RequestCategoryCreateOrConnectWithoutChildrenInput
    upsert?: RequestCategoryUpsertWithoutChildrenInput
    disconnect?: RequestCategoryWhereInput | boolean
    delete?: RequestCategoryWhereInput | boolean
    connect?: RequestCategoryWhereUniqueInput
    update?: XOR<XOR<RequestCategoryUpdateToOneWithWhereWithoutChildrenInput, RequestCategoryUpdateWithoutChildrenInput>, RequestCategoryUncheckedUpdateWithoutChildrenInput>
  }

  export type RequestCategoryUpdateManyWithoutParentNestedInput = {
    create?: XOR<RequestCategoryCreateWithoutParentInput, RequestCategoryUncheckedCreateWithoutParentInput> | RequestCategoryCreateWithoutParentInput[] | RequestCategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: RequestCategoryCreateOrConnectWithoutParentInput | RequestCategoryCreateOrConnectWithoutParentInput[]
    upsert?: RequestCategoryUpsertWithWhereUniqueWithoutParentInput | RequestCategoryUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: RequestCategoryCreateManyParentInputEnvelope
    set?: RequestCategoryWhereUniqueInput | RequestCategoryWhereUniqueInput[]
    disconnect?: RequestCategoryWhereUniqueInput | RequestCategoryWhereUniqueInput[]
    delete?: RequestCategoryWhereUniqueInput | RequestCategoryWhereUniqueInput[]
    connect?: RequestCategoryWhereUniqueInput | RequestCategoryWhereUniqueInput[]
    update?: RequestCategoryUpdateWithWhereUniqueWithoutParentInput | RequestCategoryUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: RequestCategoryUpdateManyWithWhereWithoutParentInput | RequestCategoryUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: RequestCategoryScalarWhereInput | RequestCategoryScalarWhereInput[]
  }

  export type RequestUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<RequestCreateWithoutCategoryInput, RequestUncheckedCreateWithoutCategoryInput> | RequestCreateWithoutCategoryInput[] | RequestUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: RequestCreateOrConnectWithoutCategoryInput | RequestCreateOrConnectWithoutCategoryInput[]
    upsert?: RequestUpsertWithWhereUniqueWithoutCategoryInput | RequestUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: RequestCreateManyCategoryInputEnvelope
    set?: RequestWhereUniqueInput | RequestWhereUniqueInput[]
    disconnect?: RequestWhereUniqueInput | RequestWhereUniqueInput[]
    delete?: RequestWhereUniqueInput | RequestWhereUniqueInput[]
    connect?: RequestWhereUniqueInput | RequestWhereUniqueInput[]
    update?: RequestUpdateWithWhereUniqueWithoutCategoryInput | RequestUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: RequestUpdateManyWithWhereWithoutCategoryInput | RequestUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: RequestScalarWhereInput | RequestScalarWhereInput[]
  }

  export type RequestDraftUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<RequestDraftCreateWithoutCategoryInput, RequestDraftUncheckedCreateWithoutCategoryInput> | RequestDraftCreateWithoutCategoryInput[] | RequestDraftUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: RequestDraftCreateOrConnectWithoutCategoryInput | RequestDraftCreateOrConnectWithoutCategoryInput[]
    upsert?: RequestDraftUpsertWithWhereUniqueWithoutCategoryInput | RequestDraftUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: RequestDraftCreateManyCategoryInputEnvelope
    set?: RequestDraftWhereUniqueInput | RequestDraftWhereUniqueInput[]
    disconnect?: RequestDraftWhereUniqueInput | RequestDraftWhereUniqueInput[]
    delete?: RequestDraftWhereUniqueInput | RequestDraftWhereUniqueInput[]
    connect?: RequestDraftWhereUniqueInput | RequestDraftWhereUniqueInput[]
    update?: RequestDraftUpdateWithWhereUniqueWithoutCategoryInput | RequestDraftUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: RequestDraftUpdateManyWithWhereWithoutCategoryInput | RequestDraftUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: RequestDraftScalarWhereInput | RequestDraftScalarWhereInput[]
  }

  export type RequestCategoryUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<RequestCategoryCreateWithoutParentInput, RequestCategoryUncheckedCreateWithoutParentInput> | RequestCategoryCreateWithoutParentInput[] | RequestCategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: RequestCategoryCreateOrConnectWithoutParentInput | RequestCategoryCreateOrConnectWithoutParentInput[]
    upsert?: RequestCategoryUpsertWithWhereUniqueWithoutParentInput | RequestCategoryUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: RequestCategoryCreateManyParentInputEnvelope
    set?: RequestCategoryWhereUniqueInput | RequestCategoryWhereUniqueInput[]
    disconnect?: RequestCategoryWhereUniqueInput | RequestCategoryWhereUniqueInput[]
    delete?: RequestCategoryWhereUniqueInput | RequestCategoryWhereUniqueInput[]
    connect?: RequestCategoryWhereUniqueInput | RequestCategoryWhereUniqueInput[]
    update?: RequestCategoryUpdateWithWhereUniqueWithoutParentInput | RequestCategoryUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: RequestCategoryUpdateManyWithWhereWithoutParentInput | RequestCategoryUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: RequestCategoryScalarWhereInput | RequestCategoryScalarWhereInput[]
  }

  export type RequestUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<RequestCreateWithoutCategoryInput, RequestUncheckedCreateWithoutCategoryInput> | RequestCreateWithoutCategoryInput[] | RequestUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: RequestCreateOrConnectWithoutCategoryInput | RequestCreateOrConnectWithoutCategoryInput[]
    upsert?: RequestUpsertWithWhereUniqueWithoutCategoryInput | RequestUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: RequestCreateManyCategoryInputEnvelope
    set?: RequestWhereUniqueInput | RequestWhereUniqueInput[]
    disconnect?: RequestWhereUniqueInput | RequestWhereUniqueInput[]
    delete?: RequestWhereUniqueInput | RequestWhereUniqueInput[]
    connect?: RequestWhereUniqueInput | RequestWhereUniqueInput[]
    update?: RequestUpdateWithWhereUniqueWithoutCategoryInput | RequestUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: RequestUpdateManyWithWhereWithoutCategoryInput | RequestUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: RequestScalarWhereInput | RequestScalarWhereInput[]
  }

  export type RequestDraftUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<RequestDraftCreateWithoutCategoryInput, RequestDraftUncheckedCreateWithoutCategoryInput> | RequestDraftCreateWithoutCategoryInput[] | RequestDraftUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: RequestDraftCreateOrConnectWithoutCategoryInput | RequestDraftCreateOrConnectWithoutCategoryInput[]
    upsert?: RequestDraftUpsertWithWhereUniqueWithoutCategoryInput | RequestDraftUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: RequestDraftCreateManyCategoryInputEnvelope
    set?: RequestDraftWhereUniqueInput | RequestDraftWhereUniqueInput[]
    disconnect?: RequestDraftWhereUniqueInput | RequestDraftWhereUniqueInput[]
    delete?: RequestDraftWhereUniqueInput | RequestDraftWhereUniqueInput[]
    connect?: RequestDraftWhereUniqueInput | RequestDraftWhereUniqueInput[]
    update?: RequestDraftUpdateWithWhereUniqueWithoutCategoryInput | RequestDraftUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: RequestDraftUpdateManyWithWhereWithoutCategoryInput | RequestDraftUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: RequestDraftScalarWhereInput | RequestDraftScalarWhereInput[]
  }

  export type RequestCategoryCreateNestedOneWithoutRequestsInput = {
    create?: XOR<RequestCategoryCreateWithoutRequestsInput, RequestCategoryUncheckedCreateWithoutRequestsInput>
    connectOrCreate?: RequestCategoryCreateOrConnectWithoutRequestsInput
    connect?: RequestCategoryWhereUniqueInput
  }

  export type RequestImageCreateNestedManyWithoutRequestInput = {
    create?: XOR<RequestImageCreateWithoutRequestInput, RequestImageUncheckedCreateWithoutRequestInput> | RequestImageCreateWithoutRequestInput[] | RequestImageUncheckedCreateWithoutRequestInput[]
    connectOrCreate?: RequestImageCreateOrConnectWithoutRequestInput | RequestImageCreateOrConnectWithoutRequestInput[]
    createMany?: RequestImageCreateManyRequestInputEnvelope
    connect?: RequestImageWhereUniqueInput | RequestImageWhereUniqueInput[]
  }

  export type RequestExtensionCreateNestedManyWithoutRequestInput = {
    create?: XOR<RequestExtensionCreateWithoutRequestInput, RequestExtensionUncheckedCreateWithoutRequestInput> | RequestExtensionCreateWithoutRequestInput[] | RequestExtensionUncheckedCreateWithoutRequestInput[]
    connectOrCreate?: RequestExtensionCreateOrConnectWithoutRequestInput | RequestExtensionCreateOrConnectWithoutRequestInput[]
    createMany?: RequestExtensionCreateManyRequestInputEnvelope
    connect?: RequestExtensionWhereUniqueInput | RequestExtensionWhereUniqueInput[]
  }

  export type RequestSearchIndexCreateNestedOneWithoutRequestInput = {
    create?: XOR<RequestSearchIndexCreateWithoutRequestInput, RequestSearchIndexUncheckedCreateWithoutRequestInput>
    connectOrCreate?: RequestSearchIndexCreateOrConnectWithoutRequestInput
    connect?: RequestSearchIndexWhereUniqueInput
  }

  export type RequestImageUncheckedCreateNestedManyWithoutRequestInput = {
    create?: XOR<RequestImageCreateWithoutRequestInput, RequestImageUncheckedCreateWithoutRequestInput> | RequestImageCreateWithoutRequestInput[] | RequestImageUncheckedCreateWithoutRequestInput[]
    connectOrCreate?: RequestImageCreateOrConnectWithoutRequestInput | RequestImageCreateOrConnectWithoutRequestInput[]
    createMany?: RequestImageCreateManyRequestInputEnvelope
    connect?: RequestImageWhereUniqueInput | RequestImageWhereUniqueInput[]
  }

  export type RequestExtensionUncheckedCreateNestedManyWithoutRequestInput = {
    create?: XOR<RequestExtensionCreateWithoutRequestInput, RequestExtensionUncheckedCreateWithoutRequestInput> | RequestExtensionCreateWithoutRequestInput[] | RequestExtensionUncheckedCreateWithoutRequestInput[]
    connectOrCreate?: RequestExtensionCreateOrConnectWithoutRequestInput | RequestExtensionCreateOrConnectWithoutRequestInput[]
    createMany?: RequestExtensionCreateManyRequestInputEnvelope
    connect?: RequestExtensionWhereUniqueInput | RequestExtensionWhereUniqueInput[]
  }

  export type RequestSearchIndexUncheckedCreateNestedOneWithoutRequestInput = {
    create?: XOR<RequestSearchIndexCreateWithoutRequestInput, RequestSearchIndexUncheckedCreateWithoutRequestInput>
    connectOrCreate?: RequestSearchIndexCreateOrConnectWithoutRequestInput
    connect?: RequestSearchIndexWhereUniqueInput
  }

  export type EnumRequestStatusFieldUpdateOperationsInput = {
    set?: $Enums.RequestStatus
  }

  export type RequestCategoryUpdateOneRequiredWithoutRequestsNestedInput = {
    create?: XOR<RequestCategoryCreateWithoutRequestsInput, RequestCategoryUncheckedCreateWithoutRequestsInput>
    connectOrCreate?: RequestCategoryCreateOrConnectWithoutRequestsInput
    upsert?: RequestCategoryUpsertWithoutRequestsInput
    connect?: RequestCategoryWhereUniqueInput
    update?: XOR<XOR<RequestCategoryUpdateToOneWithWhereWithoutRequestsInput, RequestCategoryUpdateWithoutRequestsInput>, RequestCategoryUncheckedUpdateWithoutRequestsInput>
  }

  export type RequestImageUpdateManyWithoutRequestNestedInput = {
    create?: XOR<RequestImageCreateWithoutRequestInput, RequestImageUncheckedCreateWithoutRequestInput> | RequestImageCreateWithoutRequestInput[] | RequestImageUncheckedCreateWithoutRequestInput[]
    connectOrCreate?: RequestImageCreateOrConnectWithoutRequestInput | RequestImageCreateOrConnectWithoutRequestInput[]
    upsert?: RequestImageUpsertWithWhereUniqueWithoutRequestInput | RequestImageUpsertWithWhereUniqueWithoutRequestInput[]
    createMany?: RequestImageCreateManyRequestInputEnvelope
    set?: RequestImageWhereUniqueInput | RequestImageWhereUniqueInput[]
    disconnect?: RequestImageWhereUniqueInput | RequestImageWhereUniqueInput[]
    delete?: RequestImageWhereUniqueInput | RequestImageWhereUniqueInput[]
    connect?: RequestImageWhereUniqueInput | RequestImageWhereUniqueInput[]
    update?: RequestImageUpdateWithWhereUniqueWithoutRequestInput | RequestImageUpdateWithWhereUniqueWithoutRequestInput[]
    updateMany?: RequestImageUpdateManyWithWhereWithoutRequestInput | RequestImageUpdateManyWithWhereWithoutRequestInput[]
    deleteMany?: RequestImageScalarWhereInput | RequestImageScalarWhereInput[]
  }

  export type RequestExtensionUpdateManyWithoutRequestNestedInput = {
    create?: XOR<RequestExtensionCreateWithoutRequestInput, RequestExtensionUncheckedCreateWithoutRequestInput> | RequestExtensionCreateWithoutRequestInput[] | RequestExtensionUncheckedCreateWithoutRequestInput[]
    connectOrCreate?: RequestExtensionCreateOrConnectWithoutRequestInput | RequestExtensionCreateOrConnectWithoutRequestInput[]
    upsert?: RequestExtensionUpsertWithWhereUniqueWithoutRequestInput | RequestExtensionUpsertWithWhereUniqueWithoutRequestInput[]
    createMany?: RequestExtensionCreateManyRequestInputEnvelope
    set?: RequestExtensionWhereUniqueInput | RequestExtensionWhereUniqueInput[]
    disconnect?: RequestExtensionWhereUniqueInput | RequestExtensionWhereUniqueInput[]
    delete?: RequestExtensionWhereUniqueInput | RequestExtensionWhereUniqueInput[]
    connect?: RequestExtensionWhereUniqueInput | RequestExtensionWhereUniqueInput[]
    update?: RequestExtensionUpdateWithWhereUniqueWithoutRequestInput | RequestExtensionUpdateWithWhereUniqueWithoutRequestInput[]
    updateMany?: RequestExtensionUpdateManyWithWhereWithoutRequestInput | RequestExtensionUpdateManyWithWhereWithoutRequestInput[]
    deleteMany?: RequestExtensionScalarWhereInput | RequestExtensionScalarWhereInput[]
  }

  export type RequestSearchIndexUpdateOneWithoutRequestNestedInput = {
    create?: XOR<RequestSearchIndexCreateWithoutRequestInput, RequestSearchIndexUncheckedCreateWithoutRequestInput>
    connectOrCreate?: RequestSearchIndexCreateOrConnectWithoutRequestInput
    upsert?: RequestSearchIndexUpsertWithoutRequestInput
    disconnect?: RequestSearchIndexWhereInput | boolean
    delete?: RequestSearchIndexWhereInput | boolean
    connect?: RequestSearchIndexWhereUniqueInput
    update?: XOR<XOR<RequestSearchIndexUpdateToOneWithWhereWithoutRequestInput, RequestSearchIndexUpdateWithoutRequestInput>, RequestSearchIndexUncheckedUpdateWithoutRequestInput>
  }

  export type RequestImageUncheckedUpdateManyWithoutRequestNestedInput = {
    create?: XOR<RequestImageCreateWithoutRequestInput, RequestImageUncheckedCreateWithoutRequestInput> | RequestImageCreateWithoutRequestInput[] | RequestImageUncheckedCreateWithoutRequestInput[]
    connectOrCreate?: RequestImageCreateOrConnectWithoutRequestInput | RequestImageCreateOrConnectWithoutRequestInput[]
    upsert?: RequestImageUpsertWithWhereUniqueWithoutRequestInput | RequestImageUpsertWithWhereUniqueWithoutRequestInput[]
    createMany?: RequestImageCreateManyRequestInputEnvelope
    set?: RequestImageWhereUniqueInput | RequestImageWhereUniqueInput[]
    disconnect?: RequestImageWhereUniqueInput | RequestImageWhereUniqueInput[]
    delete?: RequestImageWhereUniqueInput | RequestImageWhereUniqueInput[]
    connect?: RequestImageWhereUniqueInput | RequestImageWhereUniqueInput[]
    update?: RequestImageUpdateWithWhereUniqueWithoutRequestInput | RequestImageUpdateWithWhereUniqueWithoutRequestInput[]
    updateMany?: RequestImageUpdateManyWithWhereWithoutRequestInput | RequestImageUpdateManyWithWhereWithoutRequestInput[]
    deleteMany?: RequestImageScalarWhereInput | RequestImageScalarWhereInput[]
  }

  export type RequestExtensionUncheckedUpdateManyWithoutRequestNestedInput = {
    create?: XOR<RequestExtensionCreateWithoutRequestInput, RequestExtensionUncheckedCreateWithoutRequestInput> | RequestExtensionCreateWithoutRequestInput[] | RequestExtensionUncheckedCreateWithoutRequestInput[]
    connectOrCreate?: RequestExtensionCreateOrConnectWithoutRequestInput | RequestExtensionCreateOrConnectWithoutRequestInput[]
    upsert?: RequestExtensionUpsertWithWhereUniqueWithoutRequestInput | RequestExtensionUpsertWithWhereUniqueWithoutRequestInput[]
    createMany?: RequestExtensionCreateManyRequestInputEnvelope
    set?: RequestExtensionWhereUniqueInput | RequestExtensionWhereUniqueInput[]
    disconnect?: RequestExtensionWhereUniqueInput | RequestExtensionWhereUniqueInput[]
    delete?: RequestExtensionWhereUniqueInput | RequestExtensionWhereUniqueInput[]
    connect?: RequestExtensionWhereUniqueInput | RequestExtensionWhereUniqueInput[]
    update?: RequestExtensionUpdateWithWhereUniqueWithoutRequestInput | RequestExtensionUpdateWithWhereUniqueWithoutRequestInput[]
    updateMany?: RequestExtensionUpdateManyWithWhereWithoutRequestInput | RequestExtensionUpdateManyWithWhereWithoutRequestInput[]
    deleteMany?: RequestExtensionScalarWhereInput | RequestExtensionScalarWhereInput[]
  }

  export type RequestSearchIndexUncheckedUpdateOneWithoutRequestNestedInput = {
    create?: XOR<RequestSearchIndexCreateWithoutRequestInput, RequestSearchIndexUncheckedCreateWithoutRequestInput>
    connectOrCreate?: RequestSearchIndexCreateOrConnectWithoutRequestInput
    upsert?: RequestSearchIndexUpsertWithoutRequestInput
    disconnect?: RequestSearchIndexWhereInput | boolean
    delete?: RequestSearchIndexWhereInput | boolean
    connect?: RequestSearchIndexWhereUniqueInput
    update?: XOR<XOR<RequestSearchIndexUpdateToOneWithWhereWithoutRequestInput, RequestSearchIndexUpdateWithoutRequestInput>, RequestSearchIndexUncheckedUpdateWithoutRequestInput>
  }

  export type RequestCreateNestedOneWithoutImagesInput = {
    create?: XOR<RequestCreateWithoutImagesInput, RequestUncheckedCreateWithoutImagesInput>
    connectOrCreate?: RequestCreateOrConnectWithoutImagesInput
    connect?: RequestWhereUniqueInput
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type RequestUpdateOneRequiredWithoutImagesNestedInput = {
    create?: XOR<RequestCreateWithoutImagesInput, RequestUncheckedCreateWithoutImagesInput>
    connectOrCreate?: RequestCreateOrConnectWithoutImagesInput
    upsert?: RequestUpsertWithoutImagesInput
    connect?: RequestWhereUniqueInput
    update?: XOR<XOR<RequestUpdateToOneWithWhereWithoutImagesInput, RequestUpdateWithoutImagesInput>, RequestUncheckedUpdateWithoutImagesInput>
  }

  export type RequestCategoryCreateNestedOneWithoutDraftsInput = {
    create?: XOR<RequestCategoryCreateWithoutDraftsInput, RequestCategoryUncheckedCreateWithoutDraftsInput>
    connectOrCreate?: RequestCategoryCreateOrConnectWithoutDraftsInput
    connect?: RequestCategoryWhereUniqueInput
  }

  export type RequestCategoryUpdateOneWithoutDraftsNestedInput = {
    create?: XOR<RequestCategoryCreateWithoutDraftsInput, RequestCategoryUncheckedCreateWithoutDraftsInput>
    connectOrCreate?: RequestCategoryCreateOrConnectWithoutDraftsInput
    upsert?: RequestCategoryUpsertWithoutDraftsInput
    disconnect?: RequestCategoryWhereInput | boolean
    delete?: RequestCategoryWhereInput | boolean
    connect?: RequestCategoryWhereUniqueInput
    update?: XOR<XOR<RequestCategoryUpdateToOneWithWhereWithoutDraftsInput, RequestCategoryUpdateWithoutDraftsInput>, RequestCategoryUncheckedUpdateWithoutDraftsInput>
  }

  export type RequestCreateNestedOneWithoutExtensionsInput = {
    create?: XOR<RequestCreateWithoutExtensionsInput, RequestUncheckedCreateWithoutExtensionsInput>
    connectOrCreate?: RequestCreateOrConnectWithoutExtensionsInput
    connect?: RequestWhereUniqueInput
  }

  export type RequestUpdateOneRequiredWithoutExtensionsNestedInput = {
    create?: XOR<RequestCreateWithoutExtensionsInput, RequestUncheckedCreateWithoutExtensionsInput>
    connectOrCreate?: RequestCreateOrConnectWithoutExtensionsInput
    upsert?: RequestUpsertWithoutExtensionsInput
    connect?: RequestWhereUniqueInput
    update?: XOR<XOR<RequestUpdateToOneWithWhereWithoutExtensionsInput, RequestUpdateWithoutExtensionsInput>, RequestUncheckedUpdateWithoutExtensionsInput>
  }

  export type RequestCreateNestedOneWithoutSearchIndexInput = {
    create?: XOR<RequestCreateWithoutSearchIndexInput, RequestUncheckedCreateWithoutSearchIndexInput>
    connectOrCreate?: RequestCreateOrConnectWithoutSearchIndexInput
    connect?: RequestWhereUniqueInput
  }

  export type RequestUpdateOneRequiredWithoutSearchIndexNestedInput = {
    create?: XOR<RequestCreateWithoutSearchIndexInput, RequestUncheckedCreateWithoutSearchIndexInput>
    connectOrCreate?: RequestCreateOrConnectWithoutSearchIndexInput
    upsert?: RequestUpsertWithoutSearchIndexInput
    connect?: RequestWhereUniqueInput
    update?: XOR<XOR<RequestUpdateToOneWithWhereWithoutSearchIndexInput, RequestUpdateWithoutSearchIndexInput>, RequestUncheckedUpdateWithoutSearchIndexInput>
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type EnumBidStatusFieldUpdateOperationsInput = {
    set?: $Enums.BidStatus
  }

  export type EnumAmountTypeFieldUpdateOperationsInput = {
    set?: $Enums.AmountType
  }

  export type NestedUuidFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidFilter<$PrismaModel> | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumUserRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleFilter<$PrismaModel> | $Enums.UserRole
  }

  export type NestedEnumUserStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusFilter<$PrismaModel> | $Enums.UserStatus
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumAdminSubRoleNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.AdminSubRole | EnumAdminSubRoleFieldRefInput<$PrismaModel> | null
    in?: $Enums.AdminSubRole[] | ListEnumAdminSubRoleFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.AdminSubRole[] | ListEnumAdminSubRoleFieldRefInput<$PrismaModel> | null
    not?: NestedEnumAdminSubRoleNullableFilter<$PrismaModel> | $Enums.AdminSubRole | null
  }

  export type NestedUuidWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumUserRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserRole | EnumUserRoleFieldRefInput<$PrismaModel>
    in?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserRole[] | ListEnumUserRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumUserRoleWithAggregatesFilter<$PrismaModel> | $Enums.UserRole
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserRoleFilter<$PrismaModel>
    _max?: NestedEnumUserRoleFilter<$PrismaModel>
  }

  export type NestedEnumUserStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UserStatus | EnumUserStatusFieldRefInput<$PrismaModel>
    in?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.UserStatus[] | ListEnumUserStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumUserStatusWithAggregatesFilter<$PrismaModel> | $Enums.UserStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUserStatusFilter<$PrismaModel>
    _max?: NestedEnumUserStatusFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumAdminSubRoleNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AdminSubRole | EnumAdminSubRoleFieldRefInput<$PrismaModel> | null
    in?: $Enums.AdminSubRole[] | ListEnumAdminSubRoleFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.AdminSubRole[] | ListEnumAdminSubRoleFieldRefInput<$PrismaModel> | null
    not?: NestedEnumAdminSubRoleNullableWithAggregatesFilter<$PrismaModel> | $Enums.AdminSubRole | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumAdminSubRoleNullableFilter<$PrismaModel>
    _max?: NestedEnumAdminSubRoleNullableFilter<$PrismaModel>
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumTokenTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TokenType | EnumTokenTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TokenType[] | ListEnumTokenTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TokenType[] | ListEnumTokenTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTokenTypeFilter<$PrismaModel> | $Enums.TokenType
  }

  export type NestedEnumTokenTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TokenType | EnumTokenTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TokenType[] | ListEnumTokenTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TokenType[] | ListEnumTokenTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTokenTypeWithAggregatesFilter<$PrismaModel> | $Enums.TokenType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTokenTypeFilter<$PrismaModel>
    _max?: NestedEnumTokenTypeFilter<$PrismaModel>
  }

  export type NestedUuidNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableFilter<$PrismaModel> | string | null
  }

  export type NestedUuidNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedUuidNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumRequestStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.RequestStatus | EnumRequestStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRequestStatusFilter<$PrismaModel> | $Enums.RequestStatus
  }

  export type NestedEnumRequestStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.RequestStatus | EnumRequestStatusFieldRefInput<$PrismaModel>
    in?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.RequestStatus[] | ListEnumRequestStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumRequestStatusWithAggregatesFilter<$PrismaModel> | $Enums.RequestStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRequestStatusFilter<$PrismaModel>
    _max?: NestedEnumRequestStatusFilter<$PrismaModel>
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedEnumBidStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BidStatus | EnumBidStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBidStatusFilter<$PrismaModel> | $Enums.BidStatus
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedEnumBidStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BidStatus | EnumBidStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BidStatus[] | ListEnumBidStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBidStatusWithAggregatesFilter<$PrismaModel> | $Enums.BidStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBidStatusFilter<$PrismaModel>
    _max?: NestedEnumBidStatusFilter<$PrismaModel>
  }

  export type NestedEnumAmountTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AmountType | EnumAmountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AmountType[] | ListEnumAmountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AmountType[] | ListEnumAmountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAmountTypeFilter<$PrismaModel> | $Enums.AmountType
  }

  export type NestedEnumAmountTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AmountType | EnumAmountTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AmountType[] | ListEnumAmountTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AmountType[] | ListEnumAmountTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAmountTypeWithAggregatesFilter<$PrismaModel> | $Enums.AmountType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAmountTypeFilter<$PrismaModel>
    _max?: NestedEnumAmountTypeFilter<$PrismaModel>
  }

  export type UserProfileCreateWithoutUserInput = {
    id?: string
    firstName?: string
    lastName?: string
    profileImageUrl?: string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    address?: string | null
    city?: string | null
    country?: string | null
    preferences?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserProfileUncheckedCreateWithoutUserInput = {
    id?: string
    firstName?: string
    lastName?: string
    profileImageUrl?: string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    address?: string | null
    city?: string | null
    country?: string | null
    preferences?: JsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserProfileCreateOrConnectWithoutUserInput = {
    where: UserProfileWhereUniqueInput
    create: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
  }

  export type AuthTokenCreateWithoutUserInput = {
    id?: string
    tokenType: $Enums.TokenType
    tokenHash: string
    deviceFingerprint?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    expiresAt: Date | string
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    revokedAt?: Date | string | null
  }

  export type AuthTokenUncheckedCreateWithoutUserInput = {
    id?: string
    tokenType: $Enums.TokenType
    tokenHash: string
    deviceFingerprint?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    expiresAt: Date | string
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    revokedAt?: Date | string | null
  }

  export type AuthTokenCreateOrConnectWithoutUserInput = {
    where: AuthTokenWhereUniqueInput
    create: XOR<AuthTokenCreateWithoutUserInput, AuthTokenUncheckedCreateWithoutUserInput>
  }

  export type AuthTokenCreateManyUserInputEnvelope = {
    data: AuthTokenCreateManyUserInput | AuthTokenCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserProfileUpsertWithoutUserInput = {
    update: XOR<UserProfileUpdateWithoutUserInput, UserProfileUncheckedUpdateWithoutUserInput>
    create: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    where?: UserProfileWhereInput
  }

  export type UserProfileUpdateToOneWithWhereWithoutUserInput = {
    where?: UserProfileWhereInput
    data: XOR<UserProfileUpdateWithoutUserInput, UserProfileUncheckedUpdateWithoutUserInput>
  }

  export type UserProfileUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    profileImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    preferences?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserProfileUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    profileImageUrl?: NullableStringFieldUpdateOperationsInput | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    address?: NullableStringFieldUpdateOperationsInput | string | null
    city?: NullableStringFieldUpdateOperationsInput | string | null
    country?: NullableStringFieldUpdateOperationsInput | string | null
    preferences?: JsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AuthTokenUpsertWithWhereUniqueWithoutUserInput = {
    where: AuthTokenWhereUniqueInput
    update: XOR<AuthTokenUpdateWithoutUserInput, AuthTokenUncheckedUpdateWithoutUserInput>
    create: XOR<AuthTokenCreateWithoutUserInput, AuthTokenUncheckedCreateWithoutUserInput>
  }

  export type AuthTokenUpdateWithWhereUniqueWithoutUserInput = {
    where: AuthTokenWhereUniqueInput
    data: XOR<AuthTokenUpdateWithoutUserInput, AuthTokenUncheckedUpdateWithoutUserInput>
  }

  export type AuthTokenUpdateManyWithWhereWithoutUserInput = {
    where: AuthTokenScalarWhereInput
    data: XOR<AuthTokenUpdateManyMutationInput, AuthTokenUncheckedUpdateManyWithoutUserInput>
  }

  export type AuthTokenScalarWhereInput = {
    AND?: AuthTokenScalarWhereInput | AuthTokenScalarWhereInput[]
    OR?: AuthTokenScalarWhereInput[]
    NOT?: AuthTokenScalarWhereInput | AuthTokenScalarWhereInput[]
    id?: UuidFilter<"AuthToken"> | string
    userId?: UuidFilter<"AuthToken"> | string
    tokenType?: EnumTokenTypeFilter<"AuthToken"> | $Enums.TokenType
    tokenHash?: StringFilter<"AuthToken"> | string
    deviceFingerprint?: StringNullableFilter<"AuthToken"> | string | null
    ipAddress?: StringNullableFilter<"AuthToken"> | string | null
    userAgent?: StringNullableFilter<"AuthToken"> | string | null
    expiresAt?: DateTimeFilter<"AuthToken"> | Date | string
    lastUsedAt?: DateTimeNullableFilter<"AuthToken"> | Date | string | null
    createdAt?: DateTimeFilter<"AuthToken"> | Date | string
    revokedAt?: DateTimeNullableFilter<"AuthToken"> | Date | string | null
  }

  export type UserCreateWithoutProfileInput = {
    id?: string
    phone: string
    role?: $Enums.UserRole
    status?: $Enums.UserStatus
    phoneVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
    failedLoginAttempts?: number
    lockedUntil?: Date | string | null
    adminSubRole?: $Enums.AdminSubRole | null
    authTokens?: AuthTokenCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutProfileInput = {
    id?: string
    phone: string
    role?: $Enums.UserRole
    status?: $Enums.UserStatus
    phoneVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
    failedLoginAttempts?: number
    lockedUntil?: Date | string | null
    adminSubRole?: $Enums.AdminSubRole | null
    authTokens?: AuthTokenUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutProfileInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
  }

  export type UserUpsertWithoutProfileInput = {
    update: XOR<UserUpdateWithoutProfileInput, UserUncheckedUpdateWithoutProfileInput>
    create: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutProfileInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutProfileInput, UserUncheckedUpdateWithoutProfileInput>
  }

  export type UserUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    phoneVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adminSubRole?: NullableEnumAdminSubRoleFieldUpdateOperationsInput | $Enums.AdminSubRole | null
    authTokens?: AuthTokenUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    phoneVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adminSubRole?: NullableEnumAdminSubRoleFieldUpdateOperationsInput | $Enums.AdminSubRole | null
    authTokens?: AuthTokenUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutAuthTokensInput = {
    id?: string
    phone: string
    role?: $Enums.UserRole
    status?: $Enums.UserStatus
    phoneVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
    failedLoginAttempts?: number
    lockedUntil?: Date | string | null
    adminSubRole?: $Enums.AdminSubRole | null
    profile?: UserProfileCreateNestedOneWithoutUserInput
  }

  export type UserUncheckedCreateWithoutAuthTokensInput = {
    id?: string
    phone: string
    role?: $Enums.UserRole
    status?: $Enums.UserStatus
    phoneVerified?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    lastLoginAt?: Date | string | null
    failedLoginAttempts?: number
    lockedUntil?: Date | string | null
    adminSubRole?: $Enums.AdminSubRole | null
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
  }

  export type UserCreateOrConnectWithoutAuthTokensInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutAuthTokensInput, UserUncheckedCreateWithoutAuthTokensInput>
  }

  export type UserUpsertWithoutAuthTokensInput = {
    update: XOR<UserUpdateWithoutAuthTokensInput, UserUncheckedUpdateWithoutAuthTokensInput>
    create: XOR<UserCreateWithoutAuthTokensInput, UserUncheckedCreateWithoutAuthTokensInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutAuthTokensInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutAuthTokensInput, UserUncheckedUpdateWithoutAuthTokensInput>
  }

  export type UserUpdateWithoutAuthTokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    phoneVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adminSubRole?: NullableEnumAdminSubRoleFieldUpdateOperationsInput | $Enums.AdminSubRole | null
    profile?: UserProfileUpdateOneWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutAuthTokensInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    role?: EnumUserRoleFieldUpdateOperationsInput | $Enums.UserRole
    status?: EnumUserStatusFieldUpdateOperationsInput | $Enums.UserStatus
    phoneVerified?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastLoginAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    failedLoginAttempts?: IntFieldUpdateOperationsInput | number
    lockedUntil?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    adminSubRole?: NullableEnumAdminSubRoleFieldUpdateOperationsInput | $Enums.AdminSubRole | null
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
  }

  export type RequestCategoryCreateWithoutChildrenInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    iconUrl?: string | null
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: RequestCategoryCreateNestedOneWithoutChildrenInput
    requests?: RequestCreateNestedManyWithoutCategoryInput
    drafts?: RequestDraftCreateNestedManyWithoutCategoryInput
  }

  export type RequestCategoryUncheckedCreateWithoutChildrenInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    parentId?: string | null
    iconUrl?: string | null
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    requests?: RequestUncheckedCreateNestedManyWithoutCategoryInput
    drafts?: RequestDraftUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type RequestCategoryCreateOrConnectWithoutChildrenInput = {
    where: RequestCategoryWhereUniqueInput
    create: XOR<RequestCategoryCreateWithoutChildrenInput, RequestCategoryUncheckedCreateWithoutChildrenInput>
  }

  export type RequestCategoryCreateWithoutParentInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    iconUrl?: string | null
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: RequestCategoryCreateNestedManyWithoutParentInput
    requests?: RequestCreateNestedManyWithoutCategoryInput
    drafts?: RequestDraftCreateNestedManyWithoutCategoryInput
  }

  export type RequestCategoryUncheckedCreateWithoutParentInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    iconUrl?: string | null
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: RequestCategoryUncheckedCreateNestedManyWithoutParentInput
    requests?: RequestUncheckedCreateNestedManyWithoutCategoryInput
    drafts?: RequestDraftUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type RequestCategoryCreateOrConnectWithoutParentInput = {
    where: RequestCategoryWhereUniqueInput
    create: XOR<RequestCategoryCreateWithoutParentInput, RequestCategoryUncheckedCreateWithoutParentInput>
  }

  export type RequestCategoryCreateManyParentInputEnvelope = {
    data: RequestCategoryCreateManyParentInput | RequestCategoryCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type RequestCreateWithoutCategoryInput = {
    id?: string
    buyerId: string
    title: string
    description: string
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    locationCity?: string | null
    locationCountry?: string | null
    status?: $Enums.RequestStatus
    priorityScore?: number
    bidCount?: number
    viewCount?: number
    expiresAt?: Date | string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: RequestImageCreateNestedManyWithoutRequestInput
    extensions?: RequestExtensionCreateNestedManyWithoutRequestInput
    searchIndex?: RequestSearchIndexCreateNestedOneWithoutRequestInput
  }

  export type RequestUncheckedCreateWithoutCategoryInput = {
    id?: string
    buyerId: string
    title: string
    description: string
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    locationCity?: string | null
    locationCountry?: string | null
    status?: $Enums.RequestStatus
    priorityScore?: number
    bidCount?: number
    viewCount?: number
    expiresAt?: Date | string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: RequestImageUncheckedCreateNestedManyWithoutRequestInput
    extensions?: RequestExtensionUncheckedCreateNestedManyWithoutRequestInput
    searchIndex?: RequestSearchIndexUncheckedCreateNestedOneWithoutRequestInput
  }

  export type RequestCreateOrConnectWithoutCategoryInput = {
    where: RequestWhereUniqueInput
    create: XOR<RequestCreateWithoutCategoryInput, RequestUncheckedCreateWithoutCategoryInput>
  }

  export type RequestCreateManyCategoryInputEnvelope = {
    data: RequestCreateManyCategoryInput | RequestCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type RequestDraftCreateWithoutCategoryInput = {
    id?: string
    buyerId: string
    title?: string | null
    description?: string | null
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    autoSaveData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RequestDraftUncheckedCreateWithoutCategoryInput = {
    id?: string
    buyerId: string
    title?: string | null
    description?: string | null
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    autoSaveData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RequestDraftCreateOrConnectWithoutCategoryInput = {
    where: RequestDraftWhereUniqueInput
    create: XOR<RequestDraftCreateWithoutCategoryInput, RequestDraftUncheckedCreateWithoutCategoryInput>
  }

  export type RequestDraftCreateManyCategoryInputEnvelope = {
    data: RequestDraftCreateManyCategoryInput | RequestDraftCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type RequestCategoryUpsertWithoutChildrenInput = {
    update: XOR<RequestCategoryUpdateWithoutChildrenInput, RequestCategoryUncheckedUpdateWithoutChildrenInput>
    create: XOR<RequestCategoryCreateWithoutChildrenInput, RequestCategoryUncheckedCreateWithoutChildrenInput>
    where?: RequestCategoryWhereInput
  }

  export type RequestCategoryUpdateToOneWithWhereWithoutChildrenInput = {
    where?: RequestCategoryWhereInput
    data: XOR<RequestCategoryUpdateWithoutChildrenInput, RequestCategoryUncheckedUpdateWithoutChildrenInput>
  }

  export type RequestCategoryUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: RequestCategoryUpdateOneWithoutChildrenNestedInput
    requests?: RequestUpdateManyWithoutCategoryNestedInput
    drafts?: RequestDraftUpdateManyWithoutCategoryNestedInput
  }

  export type RequestCategoryUncheckedUpdateWithoutChildrenInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    requests?: RequestUncheckedUpdateManyWithoutCategoryNestedInput
    drafts?: RequestDraftUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type RequestCategoryUpsertWithWhereUniqueWithoutParentInput = {
    where: RequestCategoryWhereUniqueInput
    update: XOR<RequestCategoryUpdateWithoutParentInput, RequestCategoryUncheckedUpdateWithoutParentInput>
    create: XOR<RequestCategoryCreateWithoutParentInput, RequestCategoryUncheckedCreateWithoutParentInput>
  }

  export type RequestCategoryUpdateWithWhereUniqueWithoutParentInput = {
    where: RequestCategoryWhereUniqueInput
    data: XOR<RequestCategoryUpdateWithoutParentInput, RequestCategoryUncheckedUpdateWithoutParentInput>
  }

  export type RequestCategoryUpdateManyWithWhereWithoutParentInput = {
    where: RequestCategoryScalarWhereInput
    data: XOR<RequestCategoryUpdateManyMutationInput, RequestCategoryUncheckedUpdateManyWithoutParentInput>
  }

  export type RequestCategoryScalarWhereInput = {
    AND?: RequestCategoryScalarWhereInput | RequestCategoryScalarWhereInput[]
    OR?: RequestCategoryScalarWhereInput[]
    NOT?: RequestCategoryScalarWhereInput | RequestCategoryScalarWhereInput[]
    id?: UuidFilter<"RequestCategory"> | string
    name?: StringFilter<"RequestCategory"> | string
    slug?: StringFilter<"RequestCategory"> | string
    description?: StringNullableFilter<"RequestCategory"> | string | null
    parentId?: UuidNullableFilter<"RequestCategory"> | string | null
    iconUrl?: StringNullableFilter<"RequestCategory"> | string | null
    isActive?: BoolFilter<"RequestCategory"> | boolean
    sortOrder?: IntFilter<"RequestCategory"> | number
    createdAt?: DateTimeFilter<"RequestCategory"> | Date | string
    updatedAt?: DateTimeFilter<"RequestCategory"> | Date | string
  }

  export type RequestUpsertWithWhereUniqueWithoutCategoryInput = {
    where: RequestWhereUniqueInput
    update: XOR<RequestUpdateWithoutCategoryInput, RequestUncheckedUpdateWithoutCategoryInput>
    create: XOR<RequestCreateWithoutCategoryInput, RequestUncheckedCreateWithoutCategoryInput>
  }

  export type RequestUpdateWithWhereUniqueWithoutCategoryInput = {
    where: RequestWhereUniqueInput
    data: XOR<RequestUpdateWithoutCategoryInput, RequestUncheckedUpdateWithoutCategoryInput>
  }

  export type RequestUpdateManyWithWhereWithoutCategoryInput = {
    where: RequestScalarWhereInput
    data: XOR<RequestUpdateManyMutationInput, RequestUncheckedUpdateManyWithoutCategoryInput>
  }

  export type RequestScalarWhereInput = {
    AND?: RequestScalarWhereInput | RequestScalarWhereInput[]
    OR?: RequestScalarWhereInput[]
    NOT?: RequestScalarWhereInput | RequestScalarWhereInput[]
    id?: UuidFilter<"Request"> | string
    buyerId?: UuidFilter<"Request"> | string
    categoryId?: UuidFilter<"Request"> | string
    title?: StringFilter<"Request"> | string
    description?: StringFilter<"Request"> | string
    budgetMin?: DecimalNullableFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    budgetMax?: DecimalNullableFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    locationLat?: DecimalNullableFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    locationLng?: DecimalNullableFilter<"Request"> | Decimal | DecimalJsLike | number | string | null
    locationAddress?: StringNullableFilter<"Request"> | string | null
    locationCity?: StringNullableFilter<"Request"> | string | null
    locationCountry?: StringNullableFilter<"Request"> | string | null
    status?: EnumRequestStatusFilter<"Request"> | $Enums.RequestStatus
    priorityScore?: IntFilter<"Request"> | number
    bidCount?: IntFilter<"Request"> | number
    viewCount?: IntFilter<"Request"> | number
    expiresAt?: DateTimeNullableFilter<"Request"> | Date | string | null
    publishedAt?: DateTimeNullableFilter<"Request"> | Date | string | null
    createdAt?: DateTimeFilter<"Request"> | Date | string
    updatedAt?: DateTimeFilter<"Request"> | Date | string
  }

  export type RequestDraftUpsertWithWhereUniqueWithoutCategoryInput = {
    where: RequestDraftWhereUniqueInput
    update: XOR<RequestDraftUpdateWithoutCategoryInput, RequestDraftUncheckedUpdateWithoutCategoryInput>
    create: XOR<RequestDraftCreateWithoutCategoryInput, RequestDraftUncheckedCreateWithoutCategoryInput>
  }

  export type RequestDraftUpdateWithWhereUniqueWithoutCategoryInput = {
    where: RequestDraftWhereUniqueInput
    data: XOR<RequestDraftUpdateWithoutCategoryInput, RequestDraftUncheckedUpdateWithoutCategoryInput>
  }

  export type RequestDraftUpdateManyWithWhereWithoutCategoryInput = {
    where: RequestDraftScalarWhereInput
    data: XOR<RequestDraftUpdateManyMutationInput, RequestDraftUncheckedUpdateManyWithoutCategoryInput>
  }

  export type RequestDraftScalarWhereInput = {
    AND?: RequestDraftScalarWhereInput | RequestDraftScalarWhereInput[]
    OR?: RequestDraftScalarWhereInput[]
    NOT?: RequestDraftScalarWhereInput | RequestDraftScalarWhereInput[]
    id?: UuidFilter<"RequestDraft"> | string
    buyerId?: UuidFilter<"RequestDraft"> | string
    categoryId?: UuidNullableFilter<"RequestDraft"> | string | null
    title?: StringNullableFilter<"RequestDraft"> | string | null
    description?: StringNullableFilter<"RequestDraft"> | string | null
    budgetMin?: DecimalNullableFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    budgetMax?: DecimalNullableFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    locationLat?: DecimalNullableFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    locationLng?: DecimalNullableFilter<"RequestDraft"> | Decimal | DecimalJsLike | number | string | null
    locationAddress?: StringNullableFilter<"RequestDraft"> | string | null
    autoSaveData?: JsonFilter<"RequestDraft">
    expiresAt?: DateTimeFilter<"RequestDraft"> | Date | string
    createdAt?: DateTimeFilter<"RequestDraft"> | Date | string
    updatedAt?: DateTimeFilter<"RequestDraft"> | Date | string
  }

  export type RequestCategoryCreateWithoutRequestsInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    iconUrl?: string | null
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: RequestCategoryCreateNestedOneWithoutChildrenInput
    children?: RequestCategoryCreateNestedManyWithoutParentInput
    drafts?: RequestDraftCreateNestedManyWithoutCategoryInput
  }

  export type RequestCategoryUncheckedCreateWithoutRequestsInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    parentId?: string | null
    iconUrl?: string | null
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: RequestCategoryUncheckedCreateNestedManyWithoutParentInput
    drafts?: RequestDraftUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type RequestCategoryCreateOrConnectWithoutRequestsInput = {
    where: RequestCategoryWhereUniqueInput
    create: XOR<RequestCategoryCreateWithoutRequestsInput, RequestCategoryUncheckedCreateWithoutRequestsInput>
  }

  export type RequestImageCreateWithoutRequestInput = {
    id?: string
    imageUrl: string
    thumbnailUrl?: string | null
    originalFilename?: string | null
    fileSize: bigint | number
    mimeType: string
    width?: number | null
    height?: number | null
    sortOrder?: number
    isPrimary?: boolean
    createdAt?: Date | string
  }

  export type RequestImageUncheckedCreateWithoutRequestInput = {
    id?: string
    imageUrl: string
    thumbnailUrl?: string | null
    originalFilename?: string | null
    fileSize: bigint | number
    mimeType: string
    width?: number | null
    height?: number | null
    sortOrder?: number
    isPrimary?: boolean
    createdAt?: Date | string
  }

  export type RequestImageCreateOrConnectWithoutRequestInput = {
    where: RequestImageWhereUniqueInput
    create: XOR<RequestImageCreateWithoutRequestInput, RequestImageUncheckedCreateWithoutRequestInput>
  }

  export type RequestImageCreateManyRequestInputEnvelope = {
    data: RequestImageCreateManyRequestInput | RequestImageCreateManyRequestInput[]
    skipDuplicates?: boolean
  }

  export type RequestExtensionCreateWithoutRequestInput = {
    id?: string
    originalExpiresAt: Date | string
    newExpiresAt: Date | string
    extensionReason?: string | null
    extendedBy?: string | null
    createdAt?: Date | string
  }

  export type RequestExtensionUncheckedCreateWithoutRequestInput = {
    id?: string
    originalExpiresAt: Date | string
    newExpiresAt: Date | string
    extensionReason?: string | null
    extendedBy?: string | null
    createdAt?: Date | string
  }

  export type RequestExtensionCreateOrConnectWithoutRequestInput = {
    where: RequestExtensionWhereUniqueInput
    create: XOR<RequestExtensionCreateWithoutRequestInput, RequestExtensionUncheckedCreateWithoutRequestInput>
  }

  export type RequestExtensionCreateManyRequestInputEnvelope = {
    data: RequestExtensionCreateManyRequestInput | RequestExtensionCreateManyRequestInput[]
    skipDuplicates?: boolean
  }

  export type RequestSearchIndexCreateWithoutRequestInput = {
    id?: string
    searchVector?: string | null
    categoryPath?: string | null
    locationText?: string | null
    budgetRange?: string | null
    createdAt?: Date | string
  }

  export type RequestSearchIndexUncheckedCreateWithoutRequestInput = {
    id?: string
    searchVector?: string | null
    categoryPath?: string | null
    locationText?: string | null
    budgetRange?: string | null
    createdAt?: Date | string
  }

  export type RequestSearchIndexCreateOrConnectWithoutRequestInput = {
    where: RequestSearchIndexWhereUniqueInput
    create: XOR<RequestSearchIndexCreateWithoutRequestInput, RequestSearchIndexUncheckedCreateWithoutRequestInput>
  }

  export type RequestCategoryUpsertWithoutRequestsInput = {
    update: XOR<RequestCategoryUpdateWithoutRequestsInput, RequestCategoryUncheckedUpdateWithoutRequestsInput>
    create: XOR<RequestCategoryCreateWithoutRequestsInput, RequestCategoryUncheckedCreateWithoutRequestsInput>
    where?: RequestCategoryWhereInput
  }

  export type RequestCategoryUpdateToOneWithWhereWithoutRequestsInput = {
    where?: RequestCategoryWhereInput
    data: XOR<RequestCategoryUpdateWithoutRequestsInput, RequestCategoryUncheckedUpdateWithoutRequestsInput>
  }

  export type RequestCategoryUpdateWithoutRequestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: RequestCategoryUpdateOneWithoutChildrenNestedInput
    children?: RequestCategoryUpdateManyWithoutParentNestedInput
    drafts?: RequestDraftUpdateManyWithoutCategoryNestedInput
  }

  export type RequestCategoryUncheckedUpdateWithoutRequestsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: RequestCategoryUncheckedUpdateManyWithoutParentNestedInput
    drafts?: RequestDraftUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type RequestImageUpsertWithWhereUniqueWithoutRequestInput = {
    where: RequestImageWhereUniqueInput
    update: XOR<RequestImageUpdateWithoutRequestInput, RequestImageUncheckedUpdateWithoutRequestInput>
    create: XOR<RequestImageCreateWithoutRequestInput, RequestImageUncheckedCreateWithoutRequestInput>
  }

  export type RequestImageUpdateWithWhereUniqueWithoutRequestInput = {
    where: RequestImageWhereUniqueInput
    data: XOR<RequestImageUpdateWithoutRequestInput, RequestImageUncheckedUpdateWithoutRequestInput>
  }

  export type RequestImageUpdateManyWithWhereWithoutRequestInput = {
    where: RequestImageScalarWhereInput
    data: XOR<RequestImageUpdateManyMutationInput, RequestImageUncheckedUpdateManyWithoutRequestInput>
  }

  export type RequestImageScalarWhereInput = {
    AND?: RequestImageScalarWhereInput | RequestImageScalarWhereInput[]
    OR?: RequestImageScalarWhereInput[]
    NOT?: RequestImageScalarWhereInput | RequestImageScalarWhereInput[]
    id?: UuidFilter<"RequestImage"> | string
    requestId?: UuidFilter<"RequestImage"> | string
    imageUrl?: StringFilter<"RequestImage"> | string
    thumbnailUrl?: StringNullableFilter<"RequestImage"> | string | null
    originalFilename?: StringNullableFilter<"RequestImage"> | string | null
    fileSize?: BigIntFilter<"RequestImage"> | bigint | number
    mimeType?: StringFilter<"RequestImage"> | string
    width?: IntNullableFilter<"RequestImage"> | number | null
    height?: IntNullableFilter<"RequestImage"> | number | null
    sortOrder?: IntFilter<"RequestImage"> | number
    isPrimary?: BoolFilter<"RequestImage"> | boolean
    createdAt?: DateTimeFilter<"RequestImage"> | Date | string
  }

  export type RequestExtensionUpsertWithWhereUniqueWithoutRequestInput = {
    where: RequestExtensionWhereUniqueInput
    update: XOR<RequestExtensionUpdateWithoutRequestInput, RequestExtensionUncheckedUpdateWithoutRequestInput>
    create: XOR<RequestExtensionCreateWithoutRequestInput, RequestExtensionUncheckedCreateWithoutRequestInput>
  }

  export type RequestExtensionUpdateWithWhereUniqueWithoutRequestInput = {
    where: RequestExtensionWhereUniqueInput
    data: XOR<RequestExtensionUpdateWithoutRequestInput, RequestExtensionUncheckedUpdateWithoutRequestInput>
  }

  export type RequestExtensionUpdateManyWithWhereWithoutRequestInput = {
    where: RequestExtensionScalarWhereInput
    data: XOR<RequestExtensionUpdateManyMutationInput, RequestExtensionUncheckedUpdateManyWithoutRequestInput>
  }

  export type RequestExtensionScalarWhereInput = {
    AND?: RequestExtensionScalarWhereInput | RequestExtensionScalarWhereInput[]
    OR?: RequestExtensionScalarWhereInput[]
    NOT?: RequestExtensionScalarWhereInput | RequestExtensionScalarWhereInput[]
    id?: UuidFilter<"RequestExtension"> | string
    requestId?: UuidFilter<"RequestExtension"> | string
    originalExpiresAt?: DateTimeFilter<"RequestExtension"> | Date | string
    newExpiresAt?: DateTimeFilter<"RequestExtension"> | Date | string
    extensionReason?: StringNullableFilter<"RequestExtension"> | string | null
    extendedBy?: UuidNullableFilter<"RequestExtension"> | string | null
    createdAt?: DateTimeFilter<"RequestExtension"> | Date | string
  }

  export type RequestSearchIndexUpsertWithoutRequestInput = {
    update: XOR<RequestSearchIndexUpdateWithoutRequestInput, RequestSearchIndexUncheckedUpdateWithoutRequestInput>
    create: XOR<RequestSearchIndexCreateWithoutRequestInput, RequestSearchIndexUncheckedCreateWithoutRequestInput>
    where?: RequestSearchIndexWhereInput
  }

  export type RequestSearchIndexUpdateToOneWithWhereWithoutRequestInput = {
    where?: RequestSearchIndexWhereInput
    data: XOR<RequestSearchIndexUpdateWithoutRequestInput, RequestSearchIndexUncheckedUpdateWithoutRequestInput>
  }

  export type RequestSearchIndexUpdateWithoutRequestInput = {
    id?: StringFieldUpdateOperationsInput | string
    searchVector?: NullableStringFieldUpdateOperationsInput | string | null
    categoryPath?: NullableStringFieldUpdateOperationsInput | string | null
    locationText?: NullableStringFieldUpdateOperationsInput | string | null
    budgetRange?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestSearchIndexUncheckedUpdateWithoutRequestInput = {
    id?: StringFieldUpdateOperationsInput | string
    searchVector?: NullableStringFieldUpdateOperationsInput | string | null
    categoryPath?: NullableStringFieldUpdateOperationsInput | string | null
    locationText?: NullableStringFieldUpdateOperationsInput | string | null
    budgetRange?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestCreateWithoutImagesInput = {
    id?: string
    buyerId: string
    title: string
    description: string
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    locationCity?: string | null
    locationCountry?: string | null
    status?: $Enums.RequestStatus
    priorityScore?: number
    bidCount?: number
    viewCount?: number
    expiresAt?: Date | string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category: RequestCategoryCreateNestedOneWithoutRequestsInput
    extensions?: RequestExtensionCreateNestedManyWithoutRequestInput
    searchIndex?: RequestSearchIndexCreateNestedOneWithoutRequestInput
  }

  export type RequestUncheckedCreateWithoutImagesInput = {
    id?: string
    buyerId: string
    categoryId: string
    title: string
    description: string
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    locationCity?: string | null
    locationCountry?: string | null
    status?: $Enums.RequestStatus
    priorityScore?: number
    bidCount?: number
    viewCount?: number
    expiresAt?: Date | string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    extensions?: RequestExtensionUncheckedCreateNestedManyWithoutRequestInput
    searchIndex?: RequestSearchIndexUncheckedCreateNestedOneWithoutRequestInput
  }

  export type RequestCreateOrConnectWithoutImagesInput = {
    where: RequestWhereUniqueInput
    create: XOR<RequestCreateWithoutImagesInput, RequestUncheckedCreateWithoutImagesInput>
  }

  export type RequestUpsertWithoutImagesInput = {
    update: XOR<RequestUpdateWithoutImagesInput, RequestUncheckedUpdateWithoutImagesInput>
    create: XOR<RequestCreateWithoutImagesInput, RequestUncheckedCreateWithoutImagesInput>
    where?: RequestWhereInput
  }

  export type RequestUpdateToOneWithWhereWithoutImagesInput = {
    where?: RequestWhereInput
    data: XOR<RequestUpdateWithoutImagesInput, RequestUncheckedUpdateWithoutImagesInput>
  }

  export type RequestUpdateWithoutImagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    locationCity?: NullableStringFieldUpdateOperationsInput | string | null
    locationCountry?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    bidCount?: IntFieldUpdateOperationsInput | number
    viewCount?: IntFieldUpdateOperationsInput | number
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: RequestCategoryUpdateOneRequiredWithoutRequestsNestedInput
    extensions?: RequestExtensionUpdateManyWithoutRequestNestedInput
    searchIndex?: RequestSearchIndexUpdateOneWithoutRequestNestedInput
  }

  export type RequestUncheckedUpdateWithoutImagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    locationCity?: NullableStringFieldUpdateOperationsInput | string | null
    locationCountry?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    bidCount?: IntFieldUpdateOperationsInput | number
    viewCount?: IntFieldUpdateOperationsInput | number
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    extensions?: RequestExtensionUncheckedUpdateManyWithoutRequestNestedInput
    searchIndex?: RequestSearchIndexUncheckedUpdateOneWithoutRequestNestedInput
  }

  export type RequestCategoryCreateWithoutDraftsInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    iconUrl?: string | null
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: RequestCategoryCreateNestedOneWithoutChildrenInput
    children?: RequestCategoryCreateNestedManyWithoutParentInput
    requests?: RequestCreateNestedManyWithoutCategoryInput
  }

  export type RequestCategoryUncheckedCreateWithoutDraftsInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    parentId?: string | null
    iconUrl?: string | null
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: RequestCategoryUncheckedCreateNestedManyWithoutParentInput
    requests?: RequestUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type RequestCategoryCreateOrConnectWithoutDraftsInput = {
    where: RequestCategoryWhereUniqueInput
    create: XOR<RequestCategoryCreateWithoutDraftsInput, RequestCategoryUncheckedCreateWithoutDraftsInput>
  }

  export type RequestCategoryUpsertWithoutDraftsInput = {
    update: XOR<RequestCategoryUpdateWithoutDraftsInput, RequestCategoryUncheckedUpdateWithoutDraftsInput>
    create: XOR<RequestCategoryCreateWithoutDraftsInput, RequestCategoryUncheckedCreateWithoutDraftsInput>
    where?: RequestCategoryWhereInput
  }

  export type RequestCategoryUpdateToOneWithWhereWithoutDraftsInput = {
    where?: RequestCategoryWhereInput
    data: XOR<RequestCategoryUpdateWithoutDraftsInput, RequestCategoryUncheckedUpdateWithoutDraftsInput>
  }

  export type RequestCategoryUpdateWithoutDraftsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: RequestCategoryUpdateOneWithoutChildrenNestedInput
    children?: RequestCategoryUpdateManyWithoutParentNestedInput
    requests?: RequestUpdateManyWithoutCategoryNestedInput
  }

  export type RequestCategoryUncheckedUpdateWithoutDraftsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    parentId?: NullableStringFieldUpdateOperationsInput | string | null
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: RequestCategoryUncheckedUpdateManyWithoutParentNestedInput
    requests?: RequestUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type RequestCreateWithoutExtensionsInput = {
    id?: string
    buyerId: string
    title: string
    description: string
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    locationCity?: string | null
    locationCountry?: string | null
    status?: $Enums.RequestStatus
    priorityScore?: number
    bidCount?: number
    viewCount?: number
    expiresAt?: Date | string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category: RequestCategoryCreateNestedOneWithoutRequestsInput
    images?: RequestImageCreateNestedManyWithoutRequestInput
    searchIndex?: RequestSearchIndexCreateNestedOneWithoutRequestInput
  }

  export type RequestUncheckedCreateWithoutExtensionsInput = {
    id?: string
    buyerId: string
    categoryId: string
    title: string
    description: string
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    locationCity?: string | null
    locationCountry?: string | null
    status?: $Enums.RequestStatus
    priorityScore?: number
    bidCount?: number
    viewCount?: number
    expiresAt?: Date | string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: RequestImageUncheckedCreateNestedManyWithoutRequestInput
    searchIndex?: RequestSearchIndexUncheckedCreateNestedOneWithoutRequestInput
  }

  export type RequestCreateOrConnectWithoutExtensionsInput = {
    where: RequestWhereUniqueInput
    create: XOR<RequestCreateWithoutExtensionsInput, RequestUncheckedCreateWithoutExtensionsInput>
  }

  export type RequestUpsertWithoutExtensionsInput = {
    update: XOR<RequestUpdateWithoutExtensionsInput, RequestUncheckedUpdateWithoutExtensionsInput>
    create: XOR<RequestCreateWithoutExtensionsInput, RequestUncheckedCreateWithoutExtensionsInput>
    where?: RequestWhereInput
  }

  export type RequestUpdateToOneWithWhereWithoutExtensionsInput = {
    where?: RequestWhereInput
    data: XOR<RequestUpdateWithoutExtensionsInput, RequestUncheckedUpdateWithoutExtensionsInput>
  }

  export type RequestUpdateWithoutExtensionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    locationCity?: NullableStringFieldUpdateOperationsInput | string | null
    locationCountry?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    bidCount?: IntFieldUpdateOperationsInput | number
    viewCount?: IntFieldUpdateOperationsInput | number
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: RequestCategoryUpdateOneRequiredWithoutRequestsNestedInput
    images?: RequestImageUpdateManyWithoutRequestNestedInput
    searchIndex?: RequestSearchIndexUpdateOneWithoutRequestNestedInput
  }

  export type RequestUncheckedUpdateWithoutExtensionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    locationCity?: NullableStringFieldUpdateOperationsInput | string | null
    locationCountry?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    bidCount?: IntFieldUpdateOperationsInput | number
    viewCount?: IntFieldUpdateOperationsInput | number
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: RequestImageUncheckedUpdateManyWithoutRequestNestedInput
    searchIndex?: RequestSearchIndexUncheckedUpdateOneWithoutRequestNestedInput
  }

  export type RequestCreateWithoutSearchIndexInput = {
    id?: string
    buyerId: string
    title: string
    description: string
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    locationCity?: string | null
    locationCountry?: string | null
    status?: $Enums.RequestStatus
    priorityScore?: number
    bidCount?: number
    viewCount?: number
    expiresAt?: Date | string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category: RequestCategoryCreateNestedOneWithoutRequestsInput
    images?: RequestImageCreateNestedManyWithoutRequestInput
    extensions?: RequestExtensionCreateNestedManyWithoutRequestInput
  }

  export type RequestUncheckedCreateWithoutSearchIndexInput = {
    id?: string
    buyerId: string
    categoryId: string
    title: string
    description: string
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    locationCity?: string | null
    locationCountry?: string | null
    status?: $Enums.RequestStatus
    priorityScore?: number
    bidCount?: number
    viewCount?: number
    expiresAt?: Date | string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    images?: RequestImageUncheckedCreateNestedManyWithoutRequestInput
    extensions?: RequestExtensionUncheckedCreateNestedManyWithoutRequestInput
  }

  export type RequestCreateOrConnectWithoutSearchIndexInput = {
    where: RequestWhereUniqueInput
    create: XOR<RequestCreateWithoutSearchIndexInput, RequestUncheckedCreateWithoutSearchIndexInput>
  }

  export type RequestUpsertWithoutSearchIndexInput = {
    update: XOR<RequestUpdateWithoutSearchIndexInput, RequestUncheckedUpdateWithoutSearchIndexInput>
    create: XOR<RequestCreateWithoutSearchIndexInput, RequestUncheckedCreateWithoutSearchIndexInput>
    where?: RequestWhereInput
  }

  export type RequestUpdateToOneWithWhereWithoutSearchIndexInput = {
    where?: RequestWhereInput
    data: XOR<RequestUpdateWithoutSearchIndexInput, RequestUncheckedUpdateWithoutSearchIndexInput>
  }

  export type RequestUpdateWithoutSearchIndexInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    locationCity?: NullableStringFieldUpdateOperationsInput | string | null
    locationCountry?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    bidCount?: IntFieldUpdateOperationsInput | number
    viewCount?: IntFieldUpdateOperationsInput | number
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: RequestCategoryUpdateOneRequiredWithoutRequestsNestedInput
    images?: RequestImageUpdateManyWithoutRequestNestedInput
    extensions?: RequestExtensionUpdateManyWithoutRequestNestedInput
  }

  export type RequestUncheckedUpdateWithoutSearchIndexInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    categoryId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    locationCity?: NullableStringFieldUpdateOperationsInput | string | null
    locationCountry?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    bidCount?: IntFieldUpdateOperationsInput | number
    viewCount?: IntFieldUpdateOperationsInput | number
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: RequestImageUncheckedUpdateManyWithoutRequestNestedInput
    extensions?: RequestExtensionUncheckedUpdateManyWithoutRequestNestedInput
  }

  export type AuthTokenCreateManyUserInput = {
    id?: string
    tokenType: $Enums.TokenType
    tokenHash: string
    deviceFingerprint?: string | null
    ipAddress?: string | null
    userAgent?: string | null
    expiresAt: Date | string
    lastUsedAt?: Date | string | null
    createdAt?: Date | string
    revokedAt?: Date | string | null
  }

  export type AuthTokenUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenType?: EnumTokenTypeFieldUpdateOperationsInput | $Enums.TokenType
    tokenHash?: StringFieldUpdateOperationsInput | string
    deviceFingerprint?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AuthTokenUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenType?: EnumTokenTypeFieldUpdateOperationsInput | $Enums.TokenType
    tokenHash?: StringFieldUpdateOperationsInput | string
    deviceFingerprint?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type AuthTokenUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenType?: EnumTokenTypeFieldUpdateOperationsInput | $Enums.TokenType
    tokenHash?: StringFieldUpdateOperationsInput | string
    deviceFingerprint?: NullableStringFieldUpdateOperationsInput | string | null
    ipAddress?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastUsedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    revokedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type RequestCategoryCreateManyParentInput = {
    id?: string
    name: string
    slug: string
    description?: string | null
    iconUrl?: string | null
    isActive?: boolean
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RequestCreateManyCategoryInput = {
    id?: string
    buyerId: string
    title: string
    description: string
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    locationCity?: string | null
    locationCountry?: string | null
    status?: $Enums.RequestStatus
    priorityScore?: number
    bidCount?: number
    viewCount?: number
    expiresAt?: Date | string | null
    publishedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RequestDraftCreateManyCategoryInput = {
    id?: string
    buyerId: string
    title?: string | null
    description?: string | null
    budgetMin?: Decimal | DecimalJsLike | number | string | null
    budgetMax?: Decimal | DecimalJsLike | number | string | null
    locationLat?: Decimal | DecimalJsLike | number | string | null
    locationLng?: Decimal | DecimalJsLike | number | string | null
    locationAddress?: string | null
    autoSaveData?: JsonNullValueInput | InputJsonValue
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type RequestCategoryUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: RequestCategoryUpdateManyWithoutParentNestedInput
    requests?: RequestUpdateManyWithoutCategoryNestedInput
    drafts?: RequestDraftUpdateManyWithoutCategoryNestedInput
  }

  export type RequestCategoryUncheckedUpdateWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: RequestCategoryUncheckedUpdateManyWithoutParentNestedInput
    requests?: RequestUncheckedUpdateManyWithoutCategoryNestedInput
    drafts?: RequestDraftUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type RequestCategoryUncheckedUpdateManyWithoutParentInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    locationCity?: NullableStringFieldUpdateOperationsInput | string | null
    locationCountry?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    bidCount?: IntFieldUpdateOperationsInput | number
    viewCount?: IntFieldUpdateOperationsInput | number
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: RequestImageUpdateManyWithoutRequestNestedInput
    extensions?: RequestExtensionUpdateManyWithoutRequestNestedInput
    searchIndex?: RequestSearchIndexUpdateOneWithoutRequestNestedInput
  }

  export type RequestUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    locationCity?: NullableStringFieldUpdateOperationsInput | string | null
    locationCountry?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    bidCount?: IntFieldUpdateOperationsInput | number
    viewCount?: IntFieldUpdateOperationsInput | number
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    images?: RequestImageUncheckedUpdateManyWithoutRequestNestedInput
    extensions?: RequestExtensionUncheckedUpdateManyWithoutRequestNestedInput
    searchIndex?: RequestSearchIndexUncheckedUpdateOneWithoutRequestNestedInput
  }

  export type RequestUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    locationCity?: NullableStringFieldUpdateOperationsInput | string | null
    locationCountry?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumRequestStatusFieldUpdateOperationsInput | $Enums.RequestStatus
    priorityScore?: IntFieldUpdateOperationsInput | number
    bidCount?: IntFieldUpdateOperationsInput | number
    viewCount?: IntFieldUpdateOperationsInput | number
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    publishedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestDraftUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    autoSaveData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestDraftUncheckedUpdateWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    autoSaveData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestDraftUncheckedUpdateManyWithoutCategoryInput = {
    id?: StringFieldUpdateOperationsInput | string
    buyerId?: StringFieldUpdateOperationsInput | string
    title?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    budgetMin?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    budgetMax?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLat?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationLng?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    locationAddress?: NullableStringFieldUpdateOperationsInput | string | null
    autoSaveData?: JsonNullValueInput | InputJsonValue
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestImageCreateManyRequestInput = {
    id?: string
    imageUrl: string
    thumbnailUrl?: string | null
    originalFilename?: string | null
    fileSize: bigint | number
    mimeType: string
    width?: number | null
    height?: number | null
    sortOrder?: number
    isPrimary?: boolean
    createdAt?: Date | string
  }

  export type RequestExtensionCreateManyRequestInput = {
    id?: string
    originalExpiresAt: Date | string
    newExpiresAt: Date | string
    extensionReason?: string | null
    extendedBy?: string | null
    createdAt?: Date | string
  }

  export type RequestImageUpdateWithoutRequestInput = {
    id?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    fileSize?: BigIntFieldUpdateOperationsInput | bigint | number
    mimeType?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestImageUncheckedUpdateWithoutRequestInput = {
    id?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    fileSize?: BigIntFieldUpdateOperationsInput | bigint | number
    mimeType?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestImageUncheckedUpdateManyWithoutRequestInput = {
    id?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    thumbnailUrl?: NullableStringFieldUpdateOperationsInput | string | null
    originalFilename?: NullableStringFieldUpdateOperationsInput | string | null
    fileSize?: BigIntFieldUpdateOperationsInput | bigint | number
    mimeType?: StringFieldUpdateOperationsInput | string
    width?: NullableIntFieldUpdateOperationsInput | number | null
    height?: NullableIntFieldUpdateOperationsInput | number | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    isPrimary?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestExtensionUpdateWithoutRequestInput = {
    id?: StringFieldUpdateOperationsInput | string
    originalExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    newExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    extensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    extendedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestExtensionUncheckedUpdateWithoutRequestInput = {
    id?: StringFieldUpdateOperationsInput | string
    originalExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    newExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    extensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    extendedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RequestExtensionUncheckedUpdateManyWithoutRequestInput = {
    id?: StringFieldUpdateOperationsInput | string
    originalExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    newExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    extensionReason?: NullableStringFieldUpdateOperationsInput | string | null
    extendedBy?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use UserCountOutputTypeDefaultArgs instead
     */
    export type UserCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RequestCategoryCountOutputTypeDefaultArgs instead
     */
    export type RequestCategoryCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RequestCategoryCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RequestCountOutputTypeDefaultArgs instead
     */
    export type RequestCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RequestCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserProfileDefaultArgs instead
     */
    export type UserProfileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserProfileDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AuthTokenDefaultArgs instead
     */
    export type AuthTokenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AuthTokenDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RequestCategoryDefaultArgs instead
     */
    export type RequestCategoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RequestCategoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RequestDefaultArgs instead
     */
    export type RequestArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RequestDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RequestImageDefaultArgs instead
     */
    export type RequestImageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RequestImageDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RequestDraftDefaultArgs instead
     */
    export type RequestDraftArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RequestDraftDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RequestExtensionDefaultArgs instead
     */
    export type RequestExtensionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RequestExtensionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RequestSearchIndexDefaultArgs instead
     */
    export type RequestSearchIndexArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RequestSearchIndexDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SavedSearchDefaultArgs instead
     */
    export type SavedSearchArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SavedSearchDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BidDefaultArgs instead
     */
    export type BidArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BidDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BidTemplateDefaultArgs instead
     */
    export type BidTemplateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BidTemplateDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}