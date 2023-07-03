/**
 * Paging Object wrapper used for retrieving collections from the Spotify API.
 * [](https://developer.spotify.com/web-api/object-model/#paging-object)
 */
export interface PagingObject<T> {
  href: string;
  items: T[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

/**
 * External Url Object
 * [](https://developer.spotify.com/web-api/object-model/)
 *
 * Note that there might be other types available, it couldn't be found in the docs.
 */
export interface ExternalUrlObject {
  spotify: string;
}

/**
 * Context Object
 * [](https://developer.spotify.com/web-api/object-model/#context-object)
 */
export interface ContextObject {
  /**
   * The object type.
   */
  type: "artist" | "playlist" | "album" | "show" | "episode";
  /**
   * A link to the Web API endpoint providing full details.
   */
  href: string;
  /**
   * Known external URLs.
   */
  external_urls: ExternalUrlObject;
  /**
   * The [Spotify URI](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids).
   */
  uri: string;
}

/**
 * Simplified Artist Object
 * [artist object (simplified)](https://developer.spotify.com/web-api/object-model/)
 */
export interface ArtistObjectSimplified extends ContextObject {
  /**
   * The name of the artist.
   */
  name: string;
  /**
   * The [Spotify ID](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the artist.
   */
  id: string;
  type: "artist";
}

/**
 * Saved Track Object in Playlists
 * [](https://developer.spotify.com/web-api/object-model/)
 */
export interface SavedTrackObject {
  added_at: string;
  track: TrackObjectFull;
}

/**
 * Track Link Object
 * [](https://developer.spotify.com/web-api/object-model/#track-object-simplified)
 */
export interface TrackLinkObject {
  external_urls: ExternalUrlObject;
  href: string;
  id: string;
  type: "track";
  uri: string;
}

export interface RestrictionsObject {
  reason: string;
}

/**
 * Simplified Track Object
 * [track object (simplified)](https://developer.spotify.com/web-api/object-model/#track-object-simplified)
 */
export interface TrackObjectSimplified {
  /**
   * The artists who performed the track.
   */
  artists: ArtistObjectSimplified[];
  /**
   * A list of the countries in which the track can be played,
   * identified by their [ISO 3166-1 alpha-2 code](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
   */
  available_markets?: string[] | undefined;
  /**
   * The disc number (usually `1` unless the album consists of more than one disc).
   */
  disc_number: number;
  /**
   * The track length in milliseconds.
   */
  duration_ms: number;
  /**
   * Whether or not the track has explicit lyrics (`true` = yes it does; `false` = no it does not OR unknown).
   */
  explicit: boolean;
  /**
   * Known external URLs for this track.
   */
  external_urls: ExternalUrlObject;
  /**
   * A link to the Web API endpoint providing full details of the track.
   */
  href: string;
  /**
   * The [Spotify ID](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the track.
   */
  id: string;
  /**
   * Part of the response when [Track Relinking](https://developer.spotify.com/documentation/general/guides/track-relinking-guide/) is applied.
   * If `true`, the track is playable in the given market. Otherwise, `false`.
   */
  is_playable?: boolean | undefined;
  /**
   * Part of the response when [Track Relinking](https://developer.spotify.com/documentation/general/guides/track-relinking-guide/) is applied,
   * and the requested track has been replaced with different track.
   * The track in the `linked_from` object contains information about the originally requested track.
   */
  linked_from?: TrackLinkObject | undefined;
  /**
   * Part of the response when [Track Relinking](https://developer.spotify.com/documentation/general/guides/track-relinking-guide/) is applied,
   * the original track is not available in the given market, and Spotify did not have any tracks to relink it with.
   * The track response will still contain metadata for the original track, and a restrictions object containing the reason
   * why the track is not available: `"restrictions" : {"reason" : "market"}`.
   */
  restrictions?: RestrictionsObject | undefined;
  /**
   * The name of the track.
   */
  name: string;
  /**
   * A link to a 30 second preview (MP3 format) of the track. Can be null
   */
  preview_url: string | null;
  /**
   * The number of the track. If an album has several discs, the track number is the number on the specified disc.
   */
  track_number: number;
  /**
   * The object type: “track”.
   */
  type: "track";
  /**
   * The [Spotify URI](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the track.
   */
  uri: string;
}

/**
 * Image Object
 * [](https://developer.spotify.com/web-api/object-model/)
 */
export interface ImageObject {
  /**
   * The image height in pixels. If unknown: `null` or not returned.
   */
  height?: number | undefined;
  /**
   * The source URL of the image.
   */
  url: string;
  /**
   * The image width in pixels. If unknown: null or not returned.
   */
  width?: number | undefined;
}

/**
 * Simplified Album Object
 * [album object (simplified)](https://developer.spotify.com/web-api/object-model/#album-object-simplified)
 */
export interface AlbumObjectSimplified extends ContextObject {
  /**
   * The field is present when getting an artist’s albums.
   * Possible values are “album”, “single”, “compilation”, “appears_on”.
   * Compare to album_type this field represents relationship between the artist and the album.
   */
  album_group?: "album" | "single" | "compilation" | "appears_on" | undefined;
  /**
   * The type of the album: one of “album”, “single”, or “compilation”.
   */
  album_type: "album" | "single" | "compilation";
  /**
   * The artists of the album.
   * Each artist object includes a link in href to more detailed information about the artist.
   */
  artists: ArtistObjectSimplified[];
  /**
   * The markets in which the album is available: [ISO 3166-1 alpha-2 country codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
   * Note that an album is considered available in a market when at least 1 of its tracks is available in that market.
   */
  available_markets?: string[] | undefined;
  /**
   * The [Spotify ID](https://developer.spotify.com/documentation/web-api/#spotify-uris-and-ids) for the album.
   */
  id: string;
  /**
   * The cover art for the album in various sizes, widest first.
   */
  images: ImageObject[];
  /**
   * The name of the album. In case of an album takedown, the value may be an empty string.
   */
  name: string;
  /**
   * The date the album was first released, for example `1981`.
   * Depending on the precision, it might be shown as `1981-12` or `1981-12-15`.
   */
  release_date: string;
  /**
   * The precision with which release_date value is known: `year`, `month`, or `day`.
   */
  release_date_precision: "year" | "month" | "day";
  /**
   * Part of the response when [Track Relinking](https://developer.spotify.com/documentation/general/guides/track-relinking-guide/) is applied,
   * the original track is not available in the given market, and Spotify did not have any tracks to relink it with.
   * The track response will still contain metadata for the original track,
   * and a restrictions object containing the reason why the track is not available: `"restrictions" : {"reason" : "market"}`
   */
  restrictions?: RestrictionsObject | undefined;
  type: "album";
  /**
   * The number of tracks in the album.
   */
  total_tracks: number;
}

/**
 * External Id object
 * [](https://developer.spotify.com/web-api/object-model/)
 *
 * Note that there might be other types available, it couldn't be found in the docs.
 */
export interface ExternalIdObject {
  isrc?: string | undefined;
  ean?: string | undefined;
  upc?: string | undefined;
}

/**
 * Full Track Object
 * [track object (full)](https://developer.spotify.com/web-api/object-model/#track-object-full)
 */
export interface TrackObjectFull extends TrackObjectSimplified {
  /**
   * The album on which the track appears.
   */
  album: AlbumObjectSimplified;
  /**
   * Known external IDs for the track.
   */
  external_ids: ExternalIdObject;
  /**
   * The popularity of the track. The value will be between `0` and `100`, with `100` being the most popular.
   * The popularity of a track is a value between `0` and `100`, with `100` being the most popular.
   * The popularity is calculated by algorithm and is based, in the most part,
   * on the total number of plays the track has had and how recent those plays are.
   */
  popularity: number;
  /**
   * Whether or not the track is from a local file.
   */
  is_local?: boolean | undefined;
}

/**
 * Get user's saved tracks
 *
 * GET /v1/me/tracks
 * https://developer.spotify.com/web-api/get-users-saved-tracks/
 */
export interface UsersSavedTracksResponse
  extends PagingObject<SavedTrackObject> {}
