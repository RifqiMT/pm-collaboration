import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  FRAMEWORKS,
  IMPACT_OPTIONS,
  QUADRANT_LABEL,
  ICEBREAKER_GROUPS,
  ICEBREAKERS,
  icebreakerById,
  icebreakerChoices,
  icebreakerHead,
  previewMediaCandidates,
  columnMark,
  RETRO_TEMPLATES,
  RITUALS,
  checklistProgress,
  discussionGroups,
  formatScore,
  scoreRoadmap,
  votesLeft,
} from "@cadence/core";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { createPersonId, request, trimServer } from "./src/api";
import { colors, styles } from "./src/ui";

const SERVER_KEY = "cadence.server";
const IDENTITY_KEY = "cadence.identity";
const DEFAULT_SERVER = "http://localhost:3000";

export default function App() {
  const [server, setServer] = useState(DEFAULT_SERVER);
  const [identity, setIdentity] = useState(null);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState({ name: "home" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [savedServer, savedIdentity] = await Promise.all([
          AsyncStorage.getItem(SERVER_KEY),
          AsyncStorage.getItem(IDENTITY_KEY),
        ]);
        if (cancelled) return;
        if (savedServer) setServer(savedServer);
        if (savedIdentity) setIdentity(JSON.parse(savedIdentity));
      } catch (error) {
        console.error("[cadence] could not read saved settings", {
          message: error instanceof Error ? error.message : "unknown",
        });
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveIdentity = async (next) => {
    setIdentity(next);
    await AsyncStorage.setItem(IDENTITY_KEY, JSON.stringify(next));
  };

  const saveServer = async (next) => {
    const value = trimServer(next) || DEFAULT_SERVER;
    setServer(value);
    await AsyncStorage.setItem(SERVER_KEY, value);
    return value;
  };

  if (!ready) {
    return (
      <View style={styles.screen}>
        <Text style={[styles.body, styles.lede]}>Opening Cadence…</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      {screen.name === "home" ? (
        <Home
          server={server}
          onServer={saveServer}
          onCreate={(kind) => setScreen({ name: "create", kind })}
          onOpen={(code) => setScreen({ name: "room", code })}
        />
      ) : null}
      {screen.name === "create" ? (
        <Create
          server={server}
          kind={screen.kind}
          hostId={identity?.id}
          onBack={() => setScreen({ name: "home" })}
          onCreated={async (room, participant) => {
            await saveIdentity(participant);
            setScreen({ name: "room", code: room.code });
          }}
        />
      ) : null}
      {screen.name === "room" ? (
        <Room
          server={server}
          code={screen.code}
          identity={identity}
          onIdentity={saveIdentity}
          onBack={() => setScreen({ name: "home" })}
        />
      ) : null}
    </View>
  );
}

function Home({ server, onServer, onCreate, onOpen }) {
  const [draft, setDraft] = useState(server);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={styles.kicker}>Sprint collaboration</Text>
      <Text style={styles.title}>Cadence</Text>
      <Text style={styles.lede}>Retrospectives, sprint reviews, and roadmap scores in one shared room.</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Server</Text>
        <TextInput
          style={styles.input}
          value={draft}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setDraft}
          onEndEditing={() => onServer(draft)}
        />
      </View>
      {RITUALS.map((ritual) => (
        <Pressable
          key={ritual.kind}
          style={({ pressed }) => [
            styles.card,
            ritual.kind === "review" ? styles.accentReview : ritual.kind === "roadmap" ? styles.accentRoadmap : styles.accentRetro,
            pressed ? { opacity: 0.88 } : null,
          ]}
          onPress={async () => {
            await onServer(draft);
            onCreate(ritual.kind);
          }}
        >
          <Text style={styles.cardTitle}>{ritual.name}</Text>
          <Text style={styles.lede}>{ritual.promise}</Text>
          <Text style={styles.meta}>{ritual.steps.join("  ·  ")}</Text>
        </Pressable>
      ))}
      <View style={styles.card}>
        <Text style={styles.label}>Join with a code</Text>
        <TextInput
          style={styles.input}
          value={code}
          autoCapitalize="characters"
          maxLength={6}
          placeholder="ABC123"
          onChangeText={(value) => setCode(value.toUpperCase())}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <Pressable
        style={styles.button}
        onPress={async () => {
          const next = code.replace(/[^A-Z0-9]/g, "");
          if (next.length !== 6) {
            setError("Enter the 6-character room code.");
            return;
          }
          setError("");
          await onServer(draft);
          onOpen(next);
        }}
      >
        <Text style={styles.buttonText}>Join room</Text>
      </Pressable>
    </ScrollView>
  );
}

function Create({ server, kind, hostId, onBack, onCreated }) {
  const ritual = RITUALS.find((item) => item.kind === kind) ?? RITUALS[0];
  const [name, setName] = useState("");
  const [title, setTitle] = useState(ritual.name);
  const [templateId, setTemplateId] = useState("start-stop-continue");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function create(demo) {
    setPending(true);
    setError("");
    try {
      const data = await request(server, "/api/rooms", {
        method: "POST",
        body: JSON.stringify({
          kind,
          title: title.trim() || ritual.name,
          hostName: name.trim(),
          hostId: hostId || undefined,
          templateId: kind === "retro" ? templateId : undefined,
          demo,
        }),
      });
      await onCreated(data.room, data.participant);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Could not create the room.");
    } finally {
      setPending(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Pressable onPress={onBack} hitSlop={8}>
        <Text style={styles.back}>Back</Text>
      </Pressable>
      <Text style={styles.kicker}>New room</Text>
      <Text style={styles.title}>{ritual.name}</Text>
      <Text style={styles.lede}>{ritual.promise}</Text>
      <Text style={styles.label}>Your name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} maxLength={40} />
      <Text style={styles.label}>Session title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} maxLength={80} />
      {kind === "retro"
        ? [
            ["classic", "Classic"],
            ["pop", "Pop culture"],
          ].map(([group, label]) => (
            <View key={group} style={{ gap: 12 }}>
              <Text style={styles.kicker}>{label}</Text>
              {Object.entries(RETRO_TEMPLATES)
                .filter(([, template]) => (template.group ?? "classic") === group)
                .map(([id, template]) => (
                  <Pressable
                    key={id}
                    style={[styles.card, templateId === id ? { borderColor: colors.ink, borderWidth: 1.5 } : null]}
                    onPress={() => setTemplateId(id)}
                  >
                    <Text style={[styles.cardTitle, { fontSize: 17, color: templateId === id ? colors.terra : colors.ink }]}>
                      {template.name}
                    </Text>
                    <Text style={styles.meta}>{template.blurb}</Text>
                    <Text style={styles.meta}>
                      {template.columns.map((column) => `${columnMark(id, column.id)} ${column.title}`).join("   ")}
                    </Text>
                  </Pressable>
                ))}
            </View>
          ))
        : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.button} disabled={pending} onPress={() => create(false)}>
        <Text style={styles.buttonText}>{pending ? "Creating…" : "Create an empty room"}</Text>
      </Pressable>
      <Pressable style={styles.ghost} disabled={pending} onPress={() => create(true)}>
        <Text style={styles.ghostText}>Start from an example</Text>
      </Pressable>
    </ScrollView>
  );
}

function Room({ server, code, identity, onIdentity, onBack }) {
  const [name, setName] = useState(identity?.name ?? "");
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const actor = identity;
  const chain = useRef(Promise.resolve());
  const errorSource = useRef("");

  const send = useCallback(
    async (op) => {
      if (!actor) return false;
      const run = chain.current.then(async () => {
        const data = await request(server, `/api/rooms/${code}/ops`, {
          method: "POST",
          body: JSON.stringify({ actorId: actor.id, op }),
        });
        setRoom(data.room);
        errorSource.current = "";
        setError("");
        return true;
      });
      chain.current = run.then(
        () => undefined,
        () => undefined,
      );
      try {
        return await run;
      } catch (opError) {
        console.error("[cadence] save failed", {
          message: opError instanceof Error ? opError.message : "unknown",
        });
        errorSource.current = "op";
        setError(opError instanceof Error ? opError.message : "Could not save that change.");
        return false;
      }
    },
    [actor, code, server],
  );

  useEffect(() => {
    if (!actor) return undefined;
    let stopped = false;
    const refresh = async () => {
      try {
        const data = await request(server, `/api/rooms/${code}?actorId=${encodeURIComponent(actor.id)}`);
        if (!stopped) {
          setRoom((current) => (current && data.room.version < current.version ? current : data.room));
          if (errorSource.current === "refresh") {
            errorSource.current = "";
            setError("");
          }
        }
      } catch (refreshError) {
        console.error("[cadence] refresh failed", {
          message: refreshError instanceof Error ? refreshError.message : "unknown",
        });
        if (!stopped) {
          errorSource.current = "refresh";
          setError(refreshError instanceof Error ? refreshError.message : "Could not refresh the room.");
        }
      }
    };
    const join = async () => {
      try {
        const data = await request(server, `/api/rooms/${code}/join`, {
          method: "POST",
          body: JSON.stringify(actor),
        });
        if (!stopped) {
          setRoom(data.room);
          setError("");
        }
      } catch (joinError) {
        if (!stopped) setError(joinError instanceof Error ? joinError.message : "Could not join this room.");
      }
    };
    void join();
    const timer = setInterval(refresh, 2000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [actor, code, server]);

  if (!actor) {
    return (
      <ScrollView contentContainerStyle={styles.body}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={styles.back}>Back</Text>
        </Pressable>
        <Text style={styles.kicker}>Room {code}</Text>
        <Text style={styles.title}>What should the team call you?</Text>
        <Text style={styles.label}>Your name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} maxLength={40} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={styles.button}
          onPress={async () => {
            try {
              const person = { id: createPersonId(), name: name.trim() };
              const data = await request(server, `/api/rooms/${code}/join`, {
                method: "POST",
                body: JSON.stringify(person),
              });
              await onIdentity(data.participant);
              setRoom(data.room);
            } catch (joinError) {
              setError(joinError instanceof Error ? joinError.message : "Could not join.");
            }
          }}
        >
          <Text style={styles.buttonText}>Join the room</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Pressable onPress={onBack} hitSlop={8}>
        <Text style={styles.back}>Leave room</Text>
      </Pressable>
      <View style={styles.headerCard}>
        <Text style={styles.code}>{code}</Text>
        <Text style={styles.headerKicker}>{room?.kind === "review" ? "Sprint review" : room?.kind === "roadmap" ? "Roadmap" : "Retrospective"}</Text>
        <Text style={styles.headerTitle}>{room?.title ?? "Joining…"}</Text>
        {room ? <Text style={styles.headerMeta}>{room.participants.map((person) => person.name).join("  ·  ")}</Text> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {room?.kind === "retro" && room.retro ? <Retro room={room} actorId={actor.id} send={send} /> : null}
      {room?.kind === "review" && room.review ? <Review room={room} actorId={actor.id} send={send} /> : null}
      {room?.kind === "roadmap" && room.roadmap ? <Roadmap room={room} send={send} /> : null}
    </ScrollView>
  );
}

function Retro({ room, actorId, send }) {
  const retro = room.retro;
  const host = room.hostId === actorId;
  const [drafts, setDrafts] = useState({});
  const [actionDraft, setActionDraft] = useState("");
  const left = votesLeft(retro, actorId);
  const writing = retro.phase === "brainstorm";
  const discussing = retro.phase === "discuss";
  const voting = retro.phase === "vote";
  const acting = retro.phase === "act";
  const showBoard = writing || discussing || voting;
  const notes = [...retro.cards].filter((card) => !card.hidden).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const discussionBy = retro.discussionBy === "author" ? "author" : "status";
  const groups = discussionGroups(retro, room.participants);
  const focus = groups.find((group) => group.key === retro.discussedGroupKey) ?? groups[0] ?? null;
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.row}>
        {[
          ["icebreak", "Warm-up"],
          ["brainstorm", "Notes"],
          ["discuss", "Discuss"],
          ["vote", "Vote"],
          ["act", "Actions"],
        ].map(([phase, label]) => (
          <Pressable
            key={phase}
            disabled={!host}
            style={[styles.chip, retro.phase === phase ? styles.chipOn : null, host || retro.phase === phase ? null : styles.chipLocked]}
            onPress={() => send({ type: "retro.setPhase", phase })}
          >
            <Text style={retro.phase === phase ? styles.chipTextOn : styles.chipText}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {host ? null : <Text style={styles.meta}>Only the host can change the section.</Text>}
      {voting ? <Text style={styles.meta}>{left} dots left</Text> : null}
      {retro.phase === "icebreak" ? <IcebreakerMobile retro={retro} room={room} actorId={actorId} host={host} send={send} /> : null}
      {discussing ? (
        <View style={styles.card}>
          <Text style={styles.meta}>Discuss by</Text>
          <View style={styles.row}>
            {[
              ["status", "Status"],
              ["author", "Author"],
            ].map(([by, label]) => (
              <Pressable
                key={by}
                disabled={!host}
                style={[styles.chip, discussionBy === by ? styles.chipOn : null, host ? null : styles.chipLocked]}
                onPress={() => {
                  if (discussionBy !== by) send({ type: "retro.setDiscussionBy", by });
                }}
              >
                <Text style={discussionBy === by ? styles.chipTextOn : styles.chipText}>{label}</Text>
              </Pressable>
            ))}
          </View>
          {host ? null : <Text style={styles.meta}>Only the host can choose how the room discusses.</Text>}
          {focus ? (
            <>
              <Text style={styles.meta}>Now discussing · {discussionBy === "author" ? "Author" : "Status"}</Text>
              <Text style={styles.cardTitle}>{focus.label}</Text>
              {discussionBy === "author"
                ? retro.columns.map((column) => {
                    const columnNotes = focus.cards.filter((card) => card.columnId === column.id);
                    if (columnNotes.length === 0) return null;
                    return (
                      <View key={column.id}>
                        <Text style={styles.meta}>
                          {columnMark(retro.templateId, column.id)} {column.title}
                        </Text>
                        {columnNotes.map((card) => (
                          <Text key={card.id} style={{ color: colors.ink, fontSize: 16, lineHeight: 22 }}>
                            {card.body}
                          </Text>
                        ))}
                      </View>
                    );
                  })
                : focus.cards.map((card) => (
                    <Text key={card.id} style={{ color: colors.ink, fontSize: 16, lineHeight: 22 }}>
                      {card.body}
                    </Text>
                  ))}
              {groups.length > 1 ? (
                <Pressable
                  style={styles.ghost}
                  onPress={() => {
                    const index = groups.findIndex((group) => group.key === focus.key);
                    const next = groups[(index + 1) % groups.length];
                    if (next) send({ type: "retro.focusGroup", key: next.key });
                  }}
                >
                  <Text style={styles.ghostText}>{discussionBy === "author" ? "Next author" : "Next status"}</Text>
                </Pressable>
              ) : null}
            </>
          ) : (
            <Text style={styles.meta}>Notes appear here once the room has written them.</Text>
          )}
        </View>
      ) : null}
      {showBoard
        ? retro.columns.map((column) => {
            const cards = retro.cards.filter((card) => card.columnId === column.id && !card.hidden);
            const peak = Math.max(
              1,
              ...retro.columns.map(
                (item) => retro.cards.filter((card) => card.columnId === item.id && !card.hidden).length,
              ),
            );
            return (
              <View key={column.id} style={styles.card}>
                <View style={styles.columnHead}>
                  <Text style={[styles.sceneMark, { fontSize: 20 + (cards.length / peak) * 10 }]}>
                    {columnMark(retro.templateId, column.id)}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{column.title}</Text>
                    <Text style={styles.meta}>{column.hint}</Text>
                  </View>
                  <Text style={styles.meta}>{cards.length}</Text>
                </View>
                {writing ? <Text style={styles.notePrivate}>Only you can see your notes until Discuss</Text> : null}
                {cards.map((card) => {
                  const authorKey = card.anonymous || !card.authorId ? "anonymous" : card.authorId;
                  const aside = discussing && discussionBy === "author" && focus && authorKey !== focus.key;
                  return (
                  <View key={card.id} style={[styles.note, aside ? { opacity: 0.42 } : null]}>
                    <Text style={{ color: colors.ink, fontSize: 16, lineHeight: 22 }}>{card.body}</Text>
                    <Text style={styles.meta}>
                      {card.anonymous ? (card.mine ? "You · anonymous" : "Anonymous") : card.mine ? "You" : card.authorName}
                      {voting ? ` · ${card.voteCount} ${card.voteCount === 1 ? "vote" : "votes"}` : ""}
                    </Text>
                    {voting ? (
                      <Pressable
                        style={styles.ghost}
                        onPress={() => send({ type: "retro.vote", cardId: card.id, voting: !card.votes.includes(actorId) })}
                      >
                        <Text style={styles.ghostText}>{card.votes.includes(actorId) ? "Voted" : "Vote"}</Text>
                      </Pressable>
                    ) : null}
                  </View>
                  );
                })}
                {writing ? (
                  <>
                    <TextInput
                      style={styles.input}
                      value={drafts[column.id] ?? ""}
                      placeholder="Add a note"
                      onChangeText={(value) => setDrafts((current) => ({ ...current, [column.id]: value }))}
                    />
                    <Pressable
                      style={styles.ghost}
                      onPress={async () => {
                        const body = (drafts[column.id] ?? "").trim();
                        if (!body) return;
                        const saved = await send({ type: "retro.addCard", columnId: column.id, body, anonymous: false });
                        if (saved) setDrafts((current) => ({ ...current, [column.id]: "" }));
                      }}
                    >
                      <Text style={styles.ghostText}>Add note</Text>
                    </Pressable>
                  </>
                ) : null}
              </View>
            );
          })
        : null}
      {acting ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Actions</Text>
          <Text style={styles.meta}>Leave with an owner, not a pile of observations.</Text>
          {notes.map((card) => {
            const column = retro.columns.find((item) => item.id === card.columnId);
            const votes = `${card.voteCount} ${card.voteCount === 1 ? "vote" : "votes"}`;
            const used = retro.actions.some((action) => action.sourceCardId === card.id);
            return (
              <Pressable
                key={card.id}
                disabled={used}
                style={[styles.ghost, used ? styles.chipLocked : null]}
                onPress={() => {
                  if (used) return;
                  send({ type: "retro.addAction", body: "", sourceCardId: card.id });
                }}
              >
                <Text style={styles.ghostText}>{used ? "Already an action" : "Action from"}: {card.body}</Text>
                <Text style={styles.meta}>
                  {column ? `${columnMark(retro.templateId, column.id)} ${column.title}` : "Note"} · {votes}
                </Text>
              </Pressable>
            );
          })}
          <TextInput style={styles.input} value={actionDraft} placeholder="Add an action" onChangeText={setActionDraft} />
          <Pressable
            style={styles.ghost}
            onPress={async () => {
              const body = actionDraft.trim();
              if (!body) return;
              const saved = await send({ type: "retro.addAction", body, sourceCardId: null });
              if (saved) setActionDraft("");
            }}
          >
            <Text style={styles.ghostText}>Add action</Text>
          </Pressable>
          {retro.actions.map((action) => (
            <Pressable key={action.id} onPress={() => send({ type: "retro.setActionDone", actionId: action.id, done: !action.done })}>
              <Text>
                {action.done ? "☑" : "☐"} {action.body}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function IcebreakerMobile({ retro, room, actorId, host, send }) {
  const game = icebreakerById(retro.icebreaker);
  const round = game.rounds ? retro.icebreakerRound : 0;
  const answers = (retro.icebreakerAnswers ?? [])
    .filter((answer) => answer.game === game.id && answer.round === round)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const mine = answers.find((answer) => answer.authorId === actorId);
  const nameOf = (id) => room.participants.find((person) => person.id === id)?.name ?? "Someone";
  const prompt = game.questions?.[round] ?? game.prompt;
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Before the retro</Text>
      <Text style={styles.cardTitle}>Icebreaker</Text>
      <Text style={styles.meta}>
        {host ? "Play one short game. Notes open when you start." : "Play the game the host chose. Notes open when the host starts."}
      </Text>
      {ICEBREAKER_GROUPS.map((group) => (
        <View key={group.id} style={{ gap: 6 }}>
          <Text style={styles.meta}>
            {group.label} · {group.minutes}
          </Text>
          <View style={styles.row}>
            {ICEBREAKERS.filter((item) => item.group === group.id).map((item) => (
              <Pressable
                key={item.id}
                disabled={!host}
                style={[
                  styles.chip,
                  retro.icebreaker === item.id ? styles.chipOn : null,
                  host || retro.icebreaker === item.id ? null : styles.chipLocked,
                ]}
                onPress={() => send({ type: "retro.setIcebreaker", game: item.id })}
              >
                <Text style={retro.icebreaker === item.id ? styles.chipTextOn : styles.chipText}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
      {host ? null : <Text style={styles.meta}>Only the host can choose the icebreaker.</Text>}
      <Text style={styles.lede}>{prompt}</Text>
      <Text style={styles.meta}>{game.how}</Text>
      {game.rounds ? (
        <View style={styles.row}>
          <Pressable style={styles.ghost} disabled={!host || round <= 0} onPress={() => send({ type: "retro.nextIcebreakerRound", step: -1 })}>
            <Text style={styles.ghostText}>Previous</Text>
          </Pressable>
          <Text style={styles.meta}>
            Pair {round + 1} of {game.rounds.length}
          </Text>
          <Pressable
            style={styles.ghost}
            disabled={!host || round >= game.rounds.length - 1}
            onPress={() => send({ type: "retro.nextIcebreakerRound", step: 1 })}
          >
            <Text style={styles.ghostText}>Next</Text>
          </Pressable>
        </View>
      ) : null}
      <IcePlay game={game} round={round} answers={answers} mine={mine} actorId={actorId} nameOf={nameOf} send={send} />
      {host ? (
        <Pressable style={styles.button} onPress={() => send({ type: "retro.setPhase", phase: "brainstorm" })}>
          <Text style={styles.buttonText}>Start the retrospective</Text>
        </Pressable>
      ) : (
        <Text style={styles.meta}>The host starts the retrospective.</Text>
      )}
    </View>
  );
}

function IcePlay({ game, round, answers, mine, actorId, nameOf, send }) {
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState(["", "", ""]);
  const [lie, setLie] = useState(2);
  useEffect(() => {
    setText(mine?.body ?? "");
    setNote(mine ? icebreakerHead(mine.body).note : "");
    const saved = mine?.body.split("\n") ?? [];
    setLines([saved[0] ?? "", saved[1] ?? "", saved[2] ?? ""]);
    setLie(mine?.lie ?? 2);
  }, [game.id, mine?.body, mine?.lie]);

  if (game.mode === "draw") {
    return <Text style={styles.meta}>Drawing is shared from the web room. {answers.length} drawing{answers.length === 1 ? "" : "s"} so far.</Text>;
  }
  if (game.mode === "choice" || game.mode === "pairs" || game.mode === "note" || game.mode === "emoji") {
    const choices = game.mode === "emoji" ? game.choices ?? [] : icebreakerChoices(game, round);
    return (
      <View style={{ gap: 8 }}>
        <View style={styles.row}>
          {choices.map((choice) => {
            const picked = answers.filter((answer) =>
              game.mode === "emoji" ? answer.body.startsWith(choice) : icebreakerHead(answer.body).head === choice,
            );
            const chosen = game.mode === "emoji" ? mine?.body.startsWith(choice) : icebreakerHead(mine?.body ?? "").head === choice;
            return (
              <Pressable
                key={choice}
                style={[styles.chip, chosen ? styles.chipOn : null]}
                onPress={() => {
                  if (game.mode === "emoji") {
                    setText(choice);
                    return;
                  }
                  const extra = game.mode === "note" ? note.trim() : "";
                  send({ type: "retro.answerIcebreaker", body: extra ? `${choice} — ${extra}` : choice });
                }}
              >
                <Text style={chosen ? styles.chipTextOn : styles.chipText}>
                  {choice}
                  {picked.length ? ` · ${picked.map((answer) => nameOf(answer.authorId)).join(", ")}` : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {game.mode === "note" || game.mode === "emoji" ? (
          <TextInput
            style={styles.input}
            value={game.mode === "note" ? note : text}
            placeholder={game.placeholder}
            onChangeText={game.mode === "note" ? setNote : setText}
          />
        ) : null}
        {game.mode === "emoji" ? (
          <Pressable
            style={styles.button}
            onPress={() => {
              const sentence = text.trim();
              const emoji = (game.choices ?? []).find((item) => sentence.startsWith(item)) ?? text.trim().slice(0, 2);
              if (!sentence || sentence === emoji) return;
              send({ type: "retro.answerIcebreaker", body: sentence.startsWith(emoji) ? sentence : `${emoji} ${sentence}` });
            }}
          >
            <Text style={styles.buttonText}>Share</Text>
          </Pressable>
        ) : null}
        {answers.map((answer) => (
          <View key={answer.id} style={{ gap: 4 }}>
            <Text>
              {answer.body} · {nameOf(answer.authorId)}
            </Text>
            <GifPreview body={answer.body} />
          </View>
        ))}
      </View>
    );
  }
  if (game.mode === "truths") {
    const letters = ["A", "B", "C"];
    return (
      <View style={{ gap: 10 }}>
        <Text style={styles.meta}>Mark the lie. Other people see your statements in a shuffled order.</Text>
        {lines.map((line, index) => (
          <View key={index} style={{ gap: 6 }}>
            <View style={styles.row}>
              <Text style={styles.meta}>{letters[index]}</Text>
              <Pressable style={[styles.chip, lie === index ? styles.chipOn : null]} onPress={() => setLie(index)}>
                <Text style={lie === index ? styles.chipTextOn : styles.chipText}>{lie === index ? "The lie" : "Mark as lie"}</Text>
              </Pressable>
            </View>
            <TextInput
              style={styles.input}
              value={line}
              placeholder={`Statement ${letters[index]}`}
              onChangeText={(value) => setLines((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)))}
            />
          </View>
        ))}
        <Pressable
          style={styles.button}
          onPress={() => {
            const statements = lines.map((line) => line.trim());
            if (statements.some((line) => !line)) return;
            send({ type: "retro.answerIcebreaker", body: `${statements.join("\n")}\n#${lie + 1}` });
          }}
        >
          <Text style={styles.buttonText}>{mine ? "Update statements" : "Share with the room"}</Text>
        </Pressable>
        {mine && !mine.revealed ? (
          <Pressable style={styles.ghost} onPress={() => send({ type: "retro.revealIcebreaker" })}>
            <Text style={styles.ghostText}>Reveal the lie</Text>
          </Pressable>
        ) : null}
        {answers.map((answer) => {
          const statements = answer.body.split("\n");
          const order = answer.displayOrder?.length === 3 ? answer.displayOrder : [0, 1, 2];
          const own = answer.authorId === actorId;
          return (
            <View key={answer.id} style={[styles.card, { gap: 8 }]}>
              <Text style={styles.cardTitle}>{own ? "You" : nameOf(answer.authorId)}</Text>
              <Text style={styles.meta}>{answer.revealed ? "Revealed" : own ? "Hidden from the room" : "Guess the lie"}</Text>
              {order.map((index, position) => {
                const statement = statements[index] ?? "";
                const revealedLie = answer.revealed && answer.lie === index;
                if (own || answer.revealed) {
                  return (
                    <Text key={index}>
                      {letters[position]}. {statement}
                      {revealedLie ? " · the lie" : ""}
                      {own && !answer.revealed && answer.lie === index ? " · only you see this mark" : ""}
                    </Text>
                  );
                }
                return (
                  <Pressable key={index} style={styles.ghost} onPress={() => send({ type: "retro.guessIcebreaker", targetId: answer.id, index })}>
                    <Text style={styles.ghostText}>
                      {letters[position]}. {statement}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </View>
    );
  }
  return (
    <View style={{ gap: 8 }}>
      <TextInput style={styles.input} value={text} placeholder={game.placeholder} onChangeText={setText} />
      <Pressable
        style={styles.button}
        onPress={async () => {
          const body = text.trim();
          if (!body) return;
          const saved = await send({ type: "retro.answerIcebreaker", body });
          if (saved && !mine) setText("");
        }}
      >
        <Text style={styles.buttonText}>{mine ? "Update" : "Share"}</Text>
      </Pressable>
      {game.id === "word-association" ? <Text>Sprint{answers.map((answer) => ` → ${answer.body}`).join("")}</Text> : null}
      <GifPreview body={text} />
      {game.id === "word-association"
        ? null
        : answers.map((answer) => (
            <View key={answer.id} style={{ gap: 4 }}>
              <Text>
                {answer.body} · {nameOf(answer.authorId)}
              </Text>
              <GifPreview body={answer.body} />
            </View>
          ))}
    </View>
  );
}

function GifPreview({ body }) {
  const found = String(body ?? "").match(/https:\/\/[^\s]+/);
  const sources = found ? previewMediaCandidates(found[0]) : [];
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [body]);
  const uri = sources[index];
  if (!uri) return null;
  return (
    <Image
      source={{ uri }}
      style={{ width: "100%", height: 200, borderRadius: 12, backgroundColor: "#ffffff" }}
      resizeMode="contain"
      onError={() => setIndex((current) => current + 1)}
      accessibilityLabel="Shared GIF or picture"
    />
  );
}

function Review({ room, actorId, send }) {
  const review = room.review;
  const progress = checklistProgress(review);
  const [feedback, setFeedback] = useState("");
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.card}>
        <Text style={styles.kicker}>Sprint goal</Text>
        <Text style={styles.lede}>{review.goal || "No sprint goal yet."}</Text>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress.requiredTotal === 0 ? 0 : Math.round((progress.requiredDone / progress.requiredTotal) * 100)}%` },
            ]}
          />
        </View>
        <Text style={styles.meta}>
          {progress.requiredDone} of {progress.requiredTotal} required checks
        </Text>
      </View>
      {review.sections.map((section) => (
        <View key={section.id} style={styles.card}>
          <Text style={styles.cardTitle}>{section.title}</Text>
          <Text style={styles.meta}>{section.intent}</Text>
          {section.items.map((item) => {
            const mine = item.doneBy.includes(actorId);
            return (
              <Pressable key={item.id} onPress={() => send({ type: "review.setItemDone", itemId: item.id, done: !mine })}>
                <Text>
                  {mine ? "☑" : "☐"} {item.label}
                  {item.required ? " · required" : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
      <View style={styles.row}>
        {["ship", "iterate", "hold"].map((decision) => (
          <Pressable
            key={decision}
            style={[styles.chip, review.decision === decision ? styles.chipOn : null]}
            onPress={() => send({ type: "review.setDecision", decision: review.decision === decision ? null : decision })}
          >
            <Text style={review.decision === decision ? styles.chipTextOn : styles.chipText}>{decision}</Text>
          </Pressable>
        ))}
      </View>
      {review.feedback.map((note) => (
        <Text key={note.id} style={styles.lede}>
          {note.kind}: {note.body}
        </Text>
      ))}
      <TextInput style={styles.input} value={feedback} placeholder="Feedback for the room" onChangeText={setFeedback} />
      <Pressable
        style={styles.ghost}
        onPress={async () => {
          const body = feedback.trim();
          if (!body) return;
          const saved = await send({ type: "review.addFeedback", body, kind: "change" });
          if (saved) setFeedback("");
        }}
      >
        <Text style={styles.ghostText}>Add feedback</Text>
      </Pressable>
    </View>
  );
}

function Roadmap({ room, send }) {
  const roadmap = room.roadmap;
  const ranked = scoreRoadmap(roadmap);
  const framework = FRAMEWORKS.find((item) => item.id === roadmap.framework) ?? FRAMEWORKS[0];
  return (
    <View style={{ gap: 12 }}>
      <View style={styles.card}>
        <Text style={styles.kicker}>Objective</Text>
        <Text style={styles.lede}>{roadmap.objective || "No objective yet."}</Text>
        <Text style={styles.meta}>{framework.formula}</Text>
        <Text style={styles.meta}>{framework.help}</Text>
      </View>
      <View style={styles.row}>
        {FRAMEWORKS.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.chip, roadmap.framework === item.id ? styles.chipOn : null]}
            onPress={() => send({ type: "roadmap.setFramework", framework: item.id })}
          >
            <Text style={roadmap.framework === item.id ? styles.chipTextOn : styles.chipText}>{item.name}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.ghost} onPress={() => send({ type: "roadmap.addInitiative" })}>
        <Text style={styles.ghostText}>Add initiative</Text>
      </Pressable>
      {ranked.map((item) => (
        <InitiativeCard key={item.initiative.id} item={item} framework={roadmap.framework} send={send} />
      ))}
    </View>
  );
}

function InitiativeCard({ item, framework, send }) {
  const initiative = item.initiative;
  const patch = (fields) => send({ type: "roadmap.patchInitiative", initiativeId: initiative.id, patch: fields });
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>#{item.rank} · {QUADRANT_LABEL[item.quadrant]}</Text>
      <Text style={styles.cardTitle}>{initiative.title || "Untitled"}</Text>
      <Text style={styles.score}>{formatScore(item.score)}</Text>
      <Text style={styles.meta}>Complexity {item.complexity.toFixed(1)} / 5</Text>
      <View style={styles.insight}>
        <Text style={{ fontWeight: "700", color: colors.ink }}>{item.insight.title}</Text>
        <Text style={styles.meta}>{item.insight.detail}</Text>
      </View>
      <Text style={styles.meta}>{item.formula}</Text>
      <Text style={styles.meta}>{initiative.outcome || "No business outcome yet."}</Text>
      {framework === "rice" ? (
        <View style={{ gap: 8 }}>
          <MiniNumber label="Reach" value={initiative.reach} min={0} max={1000000} whole onCommit={(reach) => patch({ reach })} />
          <View style={styles.row}>
            {IMPACT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[styles.chip, initiative.impact === option.value ? styles.chipOn : null]}
                onPress={() => patch({ impact: option.value })}
              >
                <Text style={initiative.impact === option.value ? styles.chipTextOn : styles.chipText}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
          <MiniNumber label="Confidence %" value={Math.round(initiative.confidence * 100)} min={0} max={100} whole onCommit={(value) => patch({ confidence: value / 100 })} />
          <MiniNumber label="Effort" value={initiative.effort} min={0.25} max={240} onCommit={(effort) => patch({ effort })} />
        </View>
      ) : null}
      <Text style={styles.meta}>Complexity is technical, dependencies, then uncertainty.</Text>
      <View style={styles.row}>
        {["complexityTechnical", "complexityDependency", "complexityUncertainty"].map((key) => (
          <MiniNumber key={key} label={key.replace("complexity", "")} value={initiative[key]} min={1} max={5} whole onCommit={(value) => patch({ [key]: value })} />
        ))}
      </View>
    </View>
  );
}

function MiniNumber({ label, value, min, max, whole, onCommit }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  return (
    <View style={{ minWidth: 96, flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={text}
        keyboardType="decimal-pad"
        onChangeText={setText}
        onEndEditing={async () => {
          const trimmed = text.trim();
          const parsed = Number(trimmed);
          const inRange = Number.isFinite(parsed) && (min == null || parsed >= min) && (max == null || parsed <= max);
          if (trimmed === "" || !inRange || (whole && !Number.isInteger(parsed))) {
            setText(String(value));
            return;
          }
          if (parsed === value) {
            setText(String(value));
            return;
          }
          const saved = await onCommit(parsed);
          if (saved === false) setText(String(value));
        }}
      />
    </View>
  );
}
