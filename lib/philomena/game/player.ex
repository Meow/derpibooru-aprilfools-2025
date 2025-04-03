defmodule Philomena.Games.Player do
  alias Philomena.Users.User
  alias Philomena.Games.{Game, Team}
  alias Philomena.Repo

  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

  schema "game_players" do
    belongs_to :user, User
    belongs_to :team, Team
    belongs_to :game, Game

    field :points, :integer
    field :rank_override, :string

    timestamps(inserted_at: :created_at, updated_at: :updated_at, type: :utc_datetime)
  end

  @doc false
  def changeset(player, attrs, user) do
    player
    |> cast(attrs, [:points])
    |> put_assoc(:user, user)
    |> put_assoc(:game, Repo.one(limit(where(Game, [g], g.id == 2), 1)))
    |> put_assoc(:team, Repo.one(limit(where(Team, [t], t.id == 3), 1)))
    |> validate_required([:points, :user, :game, :team])
  end

  def points_changeset(player, attrs) do
    player
    |> cast(attrs, [:points])
  end

  def cheater_changeset(player, attrs) do
    player
    |> cast(attrs, [:points, :rank_override])
  end
end
