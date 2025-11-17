// app/(client)/home.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { cooperativeService, Cooperative } from '../../services/cooperativeService';
import { avisService } from '../../services/avisService';
import { theme } from '../../constants/theme';

export default function Home() {
  const router = useRouter();
  const { utilisateur } = useAuth();

  // États existants
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [filteredCooperatives, setFilteredCooperatives] = useState<Cooperative[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastAvis, setLastAvis] = useState<any[]>([]);

  // 🔥 NOUVEAUX ÉTATS POUR L'ASSISTANT IA
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCooperatives([]);
    } else {
      const filtered = cooperatives.filter((coop) =>
        coop.nom.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCooperatives(filtered);
    }
  }, [searchQuery, cooperatives]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const coopData = await cooperativeService.getAllCooperatives();
      setCooperatives(coopData);

      try {
        const avisData = await avisService.getLatestAvis(3);
        setLastAvis(avisData.avis || []);
      } catch (error) {
        console.log('Erreur chargement avis (non bloquant)');
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCooperativePress = (cooperativeId: number) => {
    router.push(`/(client)/voyages/detailCooperative?id=${cooperativeId}`);
  };

  const handleVoirTout = () => {
    router.push('/(client)/voyages/listeCooperative');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  // 🔥 FONCTIONS POUR L'ASSISTANT IA
  const openAIAssistant = () => {
    setShowAIModal(true);
    setChatMessages([
      {
        text: "👋 Bonjour ! Je suis votre assistant Garenet ! Comment puis-je vous aider aujourd'hui ?",
        isUser: false
      }
    ]);
  };

  const closeAIAssistant = () => {
    setShowAIModal(false);
    setAiMessage('');
    setChatMessages([]);
  };

  const generateFunnyResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Réponses amusantes prédéfinies
    const responses = [
      "Ah, une excellente question ! En tant qu'IA super intelligente, je vous conseille de prendre le bus... enfin, si vous voulez arriver à destination ! 🚌",
      "D'après mes calculs complexes, la meilleure coopérative est celle qui a des sièges confortables. Révolutionnaire, je sais ! 😄",
      "En tant qu'assistant IA, je pourrais vous donner une réponse technique... mais je préfère vous dire que vous avez un excellent goût en matière de transport !",
      "🤔 Hmm... laissez-moi réfléchir... *bruit de processeur*... La réponse est 42 ! Attendez, c'était pour une autre question...",
      "Je suis désolé, je ne peux pas répondre à ça. Mais saviez-vous que les bus sont comme les avocats ? Ils sont meilleurs quand ils sont pleins ! 🥑",
      "En analysant votre demande... *scrolling infini*... Je recommande de vérifier les horaires. Astuce de pro ! 😎",
      "En tant qu'IA, je devrais vous donner une réponse sérieuse, mais aujourd'hui je me sens taquin ! Demandez-moi plutôt une blague sur les bus !",
      "D'après mes algorithmes avancés, la solution optimale est... d'utiliser l'application Garenet. Quelle surprise ! 😂"
    ];

    // Réponses contextuelles amusantes
    if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('coucou')) {
      return "👋 Salut à toi, humain ! Prêt pour une aventure en bus ? Moi je suis prêt à dire des bêtises !";
    }
    
    if (lowerMessage.includes('heure') || lowerMessage.includes('horaire')) {
      return "⏰ Les horaires ? Je pourrais vous donner l'heure exacte... si j'avais une montre ! Heureusement, Garenet l'a pour vous !";
    }
    
    if (lowerMessage.includes('prix') || lowerMessage.includes('tarif')) {
      return "💰 Les prix ? C'est simple : moins cher qu'un taxi, plus confort qu'une marche de 50km ! Détails dans l'application !";
    }
    
    if (lowerMessage.includes('bus') || lowerMessage.includes('car')) {
      return "🚌 Un bus, c'est comme une boîte de chocolats : on ne sait jamais sur quel siège on va tomber !";
    }
    
    if (lowerMessage.includes('blague') || lowerMessage.includes('drôle') || lowerMessage.includes('rire')) {
      return "😂 Pourquoi le bus a-t-il été à l'école ? Pour apprendre les arrêts ! ... Désolé, je suis meilleur pour les réservations que pour les blagues !";
    }
    
    if (lowerMessage.includes('merci')) {
      return "🤖 De rien ! N'oubliez pas : je suis un assistant IA fictif, mais mon aide est 100% réelle (enfin, à 42%) !";
    }

    // Réponse aléatoire par défaut
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendAIMessage = () => {
    if (aiMessage.trim() === '') return;

    // Ajouter le message de l'utilisateur
    const userMessage = { text: aiMessage, isUser: true };
    setChatMessages(prev => [...prev, userMessage]);
    setAiMessage('');
    setIsAiTyping(true);

    // Simuler un délai de réponse de l'IA
    setTimeout(() => {
      const aiResponse = generateFunnyResponse(aiMessage);
      setChatMessages(prev => [...prev, { text: aiResponse, isUser: false }]);
      setIsAiTyping(false);
    }, 1500);
  };

  const displayCooperatives = searchQuery.trim() !== '' ? filteredCooperatives : cooperatives.slice(0, 5);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>
              {utilisateur?.prenoms || utilisateur?.nom || 'Voyageur'}
            </Text>
          </View>
          
          {/* 🔥 BOUTON ASSISTANT IA */}
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={openAIAssistant}
            >
              <Ionicons name="sparkles" size={22} color={theme.colors.text.inverse} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push('/(client)/notification')}
            >
              <Ionicons name="notifications-outline" size={28} color={theme.colors.text.inverse} />
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Barre de recherche */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une coopérative..."
            placeholderTextColor={theme.colors.neutral[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.neutral[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary[500]]} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : (
          <>
            {/* MODE RECHERCHE */}
            {searchQuery.trim() !== '' ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Résultats ({filteredCooperatives.length})
                </Text>
                {filteredCooperatives.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="search-outline" size={60} color={theme.colors.neutral[300]} />
                    <Text style={styles.emptyText}>Aucune coopérative trouvée</Text>
                    <Text style={styles.emptySubtext}>
                      Essayez un autre terme de recherche
                    </Text>
                  </View>
                ) : (
                  <View style={styles.cooperativesGrid}>
                    {filteredCooperatives.map((coop) => (
                      <TouchableOpacity
                        key={coop.id}
                        style={styles.cooperativeCard}
                        onPress={() => handleCooperativePress(coop.id)}
                      >
                        <View style={styles.cooperativeImageContainer}>
                          {coop.logo ? (
                            <Image source={{ uri: coop.logo }} style={styles.cooperativeImage} />
                          ) : (
                            <View style={styles.cooperativeImagePlaceholder}>
                              <Ionicons name="bus" size={32} color={theme.colors.primary[500]} />
                            </View>
                          )}
                        </View>
                        <View style={styles.cooperativeInfo}>
                          <Text style={styles.cooperativeName} numberOfLines={2}>
                            {coop.nom}
                          </Text>
                          <View style={styles.cooperativeFooter}>
                            <View style={styles.statusBadge}>
                              <View
                                style={[
                                  styles.statusDot,
                                  {
                                    backgroundColor:
                                      coop.statut === 'actif'
                                        ? theme.colors.semantic.success
                                        : theme.colors.neutral[400],
                                  },
                                ]}
                              />
                              <Text style={styles.statusText}>{coop.statut}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={theme.colors.neutral[400]} />
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <>
                {/* MODE NORMAL - CONTENU ACCUEIL */}
                <View style={styles.section}>
                  <View style={styles.quickActionsGrid}>
                    <TouchableOpacity
                      style={styles.quickActionCard}
                      onPress={() => router.push('/(client)/voyages')}
                    >
                      <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.primary[50] }]}>
                        <Ionicons name="search" size={28} color={theme.colors.primary[500]} />
                      </View>
                      <Text style={styles.quickActionText}>Rechercher{'\n'}un voyage</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickActionCard}
                      onPress={() => router.push('/(client)/reservations')}
                    >
                      <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.secondary[50] }]}>
                        <Ionicons name="ticket" size={28} color={theme.colors.secondary[500]} />
                      </View>
                      <Text style={styles.quickActionText}>Mes{'\n'}réservations</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickActionCard}
                      onPress={() => router.push('/(client)/historique')}
                    >
                      <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.semantic.info + '20' }]}>
                        <Ionicons name="time" size={28} color={theme.colors.semantic.info} />
                      </View>
                      <Text style={styles.quickActionText}>Historique{'\n'}voyages</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickActionCard}
                      onPress={() => router.push('/(client)/profil')}
                    >
                      <View style={[styles.quickActionIcon, { backgroundColor: theme.colors.neutral[100] }]}>
                        <Ionicons name="person" size={28} color={theme.colors.neutral[600]} />
                      </View>
                      <Text style={styles.quickActionText}>Mon{'\n'}profil</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Section Coopératives populaires */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Coopératives populaires</Text>
                    <TouchableOpacity onPress={handleVoirTout}>
                      <Text style={styles.voirToutText}>Voir tout</Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalScroll}
                  >
                    {displayCooperatives.map((coop) => (
                      <TouchableOpacity
                        key={coop.id}
                        style={styles.cooperativeCardHorizontal}
                        onPress={() => handleCooperativePress(coop.id)}
                      >
                        <View style={styles.cooperativeImageContainerHorizontal}>
                          {coop.logo ? (
                            <Image source={{ uri: coop.logo }} style={styles.cooperativeImageHorizontal} />
                          ) : (
                            <View style={styles.cooperativeImagePlaceholderHorizontal}>
                              <Ionicons name="bus" size={40} color={theme.colors.primary[500]} />
                            </View>
                          )}
                        </View>
                        <Text style={styles.cooperativeNameHorizontal} numberOfLines={2}>
                          {coop.nom}
                        </Text>
                        <View style={styles.cooperativeMetaHorizontal}>
                          <View
                            style={[
                              styles.statusDot,
                              {
                                backgroundColor:
                                  coop.statut === 'actif'
                                    ? theme.colors.semantic.success
                                    : theme.colors.neutral[400],
                              },
                            ]}
                          />
                          <Text style={styles.statusTextSmall}>{coop.statut}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Section Derniers avis */}
                {lastAvis.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Derniers avis</Text>
                    <View style={styles.avisList}>
                      {lastAvis.map((avis, index) => (
                        <View key={index} style={styles.avisCard}>
                          <View style={styles.avisHeader}>
                            <View style={styles.avisUserInfo}>
                              <View style={styles.avisAvatar}>
                                <Ionicons name="person" size={20} color={theme.colors.primary[500]} />
                              </View>
                              <View>
                                <Text style={styles.avisUserName}>{avis.client.nom_complet}</Text>
                                <View style={styles.avisStars}>
                                  {[...Array(5)].map((_, i) => (
                                    <Ionicons
                                      key={i}
                                      name={i < avis.note ? 'star' : 'star-outline'}
                                      size={14}
                                      color="#FFB800"
                                    />
                                  ))}
                                </View>
                              </View>
                            </View>
                          </View>
                          {avis.commentaire && (
                            <Text style={styles.avisComment} numberOfLines={2}>
                              {avis.commentaire}
                            </Text>
                          )}
                          <Text style={styles.avisTrajet}>{avis.voyage.trajet}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Bannière promotionnelle */}
                <View style={styles.section}>
                  <View style={styles.promoBanner}>
                    <Ionicons name="gift" size={40} color={theme.colors.secondary[500]} />
                    <View style={styles.promoContent}>
                      <Text style={styles.promoTitle}>Offre spéciale !</Text>
                      <Text style={styles.promoText}>
                        Réservez maintenant et bénéficiez de réductions exclusives
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* 🔥 MODAL ASSISTANT IA */}
      <Modal
        visible={showAIModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeAIAssistant}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.aiModalContainer}
        >
          <View style={styles.aiModalContent}>
            {/* Header du modal */}
            <View style={styles.aiModalHeader}>
              <View style={styles.aiTitleContainer}>
                <Ionicons name="sparkles" size={24} color={theme.colors.primary[500]} />
                <Text style={styles.aiModalTitle}>Assistant Garenet</Text>
              </View>
              <TouchableOpacity onPress={closeAIAssistant} style={styles.aiCloseButton}>
                <Ionicons name="close" size={24} color={theme.colors.neutral[500]} />
              </TouchableOpacity>
            </View>

            {/* Zone de chat */}
            <ScrollView 
              style={styles.aiChatContainer}
              contentContainerStyle={styles.aiChatContent}
              ref={ref => {
                if (ref) {
                  setTimeout(() => ref.scrollToEnd({ animated: true }), 100);
                }
              }}
            >
              {chatMessages.map((message, index) => (
                <View
                  key={index}
                  style={[
                    styles.aiMessageBubble,
                    message.isUser ? styles.aiUserMessage : styles.aiBotMessage
                  ]}
                >
                  <Text style={message.isUser ? styles.aiUserText : styles.aiBotText}>
                    {message.text}
                  </Text>
                </View>
              ))}
              {isAiTyping && (
                <View style={[styles.aiMessageBubble, styles.aiBotMessage]}>
                  <Text style={styles.aiBotText}>🤔 L'assistant réfléchit...</Text>
                </View>
              )}
            </ScrollView>

            {/* Input pour envoyer des messages */}
            <View style={styles.aiInputContainer}>
              <TextInput
                style={styles.aiInput}
                placeholder="Posez-moi une question..."
                value={aiMessage}
                onChangeText={setAiMessage}
                multiline
                maxLength={200}
              />
              <TouchableOpacity 
                style={[
                  styles.aiSendButton,
                  aiMessage.trim() === '' && styles.aiSendButtonDisabled
                ]}
                onPress={sendAIMessage}
                disabled={aiMessage.trim() === '' || isAiTyping}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={aiMessage.trim() === '' ? theme.colors.neutral[400] : theme.colors.text.inverse} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    backgroundColor: theme.colors.primary[500],
    paddingTop: 50,
    paddingBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  // 🔥 NOUVEAUX STYLES POUR L'ASSISTANT IA
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  aiButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.xs,
  },
  // Modal IA
  aiModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  aiModalContent: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    height: '70%',
    ...theme.shadows.md,
  },
  aiModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[200],
  },
  aiTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  aiModalTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  aiCloseButton: {
    padding: theme.spacing.xs,
  },
  aiChatContainer: {
    flex: 1,
  },
  aiChatContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  aiMessageBubble: {
    maxWidth: '85%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  aiUserMessage: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary[500],
    borderBottomRightRadius: theme.borderRadius.sm,
  },
  aiBotMessage: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.neutral[100],
    borderBottomLeftRadius: theme.borderRadius.sm,
  },
  aiUserText: {
    color: theme.colors.text.inverse,
    fontSize: theme.typography.sizes.body,
  },
  aiBotText: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.sizes.body,
  },
  aiInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.neutral[200],
    gap: theme.spacing.sm,
  },
  aiInput: {
    flex: 1,
    backgroundColor: theme.colors.neutral[100],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
    maxHeight: 100,
  },
  aiSendButton: {
    backgroundColor: theme.colors.primary[500],
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiSendButtonDisabled: {
    backgroundColor: theme.colors.neutral[300],
  },
  // STYLES EXISTANTS (inchangés)
  greeting: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.light,
    marginBottom: 4,
  },
  userName: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  notificationButton: {
    position: 'relative',
    padding: theme.spacing.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.semantic.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary[500],
  },
  notificationBadgeText: {
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: theme.typography.weights.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.primary,
    paddingVertical: theme.spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text.secondary,
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  voirToutText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.weights.semibold,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  quickActionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  quickActionText: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  horizontalScroll: {
    paddingRight: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  cooperativeCardHorizontal: {
    width: 150,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cooperativeImageContainerHorizontal: {
    width: '100%',
    height: 80,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  cooperativeImageHorizontal: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cooperativeImagePlaceholderHorizontal: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cooperativeNameHorizontal: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    minHeight: 32,
  },
  cooperativeMetaHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusTextSmall: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  cooperativesGrid: {
    gap: theme.spacing.md,
  },
  cooperativeCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cooperativeImageContainer: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginRight: theme.spacing.md,
  },
  cooperativeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cooperativeImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cooperativeInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cooperativeName: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  cooperativeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
  },
  emptyText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  avisList: {
    gap: theme.spacing.md,
  },
  avisCard: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  avisHeader: {
    marginBottom: theme.spacing.sm,
  },
  avisUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avisAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avisUserName: {
    fontSize: theme.typography.sizes.caption,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  avisStars: {
    flexDirection: 'row',
    gap: 2,
  },
  avisComment: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  avisTrajet: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.primary[500],
    fontWeight: theme.typography.weights.medium,
  },
  promoBanner: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondary[50],
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    gap: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.secondary[200],
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.secondary[700],
    marginBottom: 4,
  },
  promoText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.secondary[600],
  },
});