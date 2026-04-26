import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeFilter, setActiveFilter] = useState('All');
  const [gender, setGender] = useState('Women');
  const [clothes, setClothes] = useState([]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Tops');
  const [newItemGender, setNewItemGender] = useState('Women');
  const [newItemImage, setNewItemImage] = useState(null);

  // اللغة: darija, francais, english
  const [language, setLanguage] = useState('darija');

  // السمية ديال المستخدم
  const [userName, setUserName] = useState('');
  const [isFirstTime, setIsFirstTime] = useState(true);

  const [messages, setMessages] = useState([]);
  const [userMessage, setUserMessage] = useState('');
  const [suggestedOutfit, setSuggestedOutfit] = useState(null);

  useEffect(() => {
    loadUserData();
    loadClothes();
  }, []);

  useEffect(() => {
    const welcomes = {
      darija: `أهلا ${userName || 'أ لالة'}! أنا فاتي 👗 شنو غادي نلبسو اليوم؟ قولي ليا فين غادية نعاونك`,
      francais: `Bonjour ${userName || ''}! Je suis Fati 👗 Qu'est-ce qu'on porte aujourd'hui? Dis-moi où tu vas je t'aide`,
      english: `Hello ${userName || ''}! I'm Fati 👗 What are we wearing today? Tell me where you're going and I'll help you`
    };
    if (userName) {
      setMessages([{ id: 1, text: welcomes[language], isFati: true }]);
    }
  }, [language, userName]);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) {
        setUserName(name);
        setIsFirstTime(false);
      }
    } catch (e) {
      console.log('Error loading name:', e);
    }
  };

  const saveUserName = async (name) => {
    try {
      await AsyncStorage.setItem('userName', name);
      setUserName(name);
      setIsFirstTime(false);
    } catch (e) {
      console.log('Error saving name:', e);
    }
  };

  const saveClothes = async (newClothes) => {
    try {
      await AsyncStorage.setItem('clothes', JSON.stringify(newClothes));
    } catch (e) {
      console.log('Error saving:', e);
    }
  };

  const loadClothes = async () => {
    try {
      const stored = await AsyncStorage.getItem('clothes');
      if (stored) setClothes(JSON.parse(stored));
    } catch (e) {
      console.log('Error loading:', e);
    }
  };const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status!== 'granted') {
      Alert.alert('عافاك', 'خاصنا الصلاحية ديال الكاميرا باش تصوري');
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
    });
    if (!result.canceled) setNewItemImage(result.assets[0].uri);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.5,
    });
    if (!result.canceled) setNewItemImage(result.assets[0].uri);
  };

  const filteredClothes = clothes
.filter(item => item.gender === gender)
.filter(item => activeFilter === 'All' || item.category === activeFilter);

  const categories = gender === 'Women'
? ['All', 'Tops', 'Bottoms', 'Dresses', 'Shoes']
    : ['All', 'Tops', 'Bottoms', 'Shoes'];

  const addItemCategories = ['Tops', 'Bottoms', 'Dresses', 'Shoes'];

  const handleAddItem = () => {
    if (newItemName === '') {
      Alert.alert('Error', 'Please enter item name');
      return;
    }
    if (!newItemImage) {
      Alert.alert('Error', 'Please add a photo');
      return;
    }

    const newItem = {
      id: Date.now(),
      name: newItemName,
      category: newItemCategory,
      gender: newItemGender,
      wears: 0,
      image: newItemImage,
    };

    const updatedClothes = [...clothes, newItem];
    setClothes(updatedClothes);
    saveClothes(updatedClothes);

    setNewItemName('');
    setNewItemImage(null);
    setCurrentPage('closet');
  };

  const wearItem = (id) => {
    const updatedClothes = clothes.map(item =>
      item.id === id? {...item, wears: item.wears + 1 } : item
    );
    setClothes(updatedClothes);
    saveClothes(updatedClothes);
  };

  const deleteItem = (id) => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', onPress: () => {
          const updatedClothes = clothes.filter(item => item.id!== id);
          setClothes(updatedClothes);
          saveClothes(updatedClothes);
        }
      }
    ]);
  };

  const getFatiReply = (msg, lang) => {
    const m = msg.toLowerCase();

    if (lang === 'darija') {
      if (m.includes('سخون') || m.includes('chaud') || m.includes('hot') || m.includes('صيف')) {
        return 'الجو سخون بزاف؟ نصحك بشي حاجة خفيفة. الكتان والقطن مزيانين فالسخونية. عندك شي كسوة قصيرة ولا قميجة بلا كم؟';
      } else if (m.includes('برد') || m.includes('froid') || m.includes('cold') || m.includes('شتا')) {
        return 'البرد كيضرب؟ ديري الكوشات! قميجة سخونة وجاكيط. وما تنسايش الكاشكول. شنو عندك ديال الحوايج السخان؟';
      } else if (m.includes('خرجة') || m.includes('عرس') || m.includes('mariage') || m.includes('wedding') || m.includes('party')) {
        return 'عندك مناسبة خاصة؟ خاصك تكوني طوب! إلا عرس نصحك بكسوة طويلة أنيقة. إلا خرجة عادية، قميجة كلاس مع سروال زوين وصباط عالي. قولي ليا شنو المناسبة بالضبط؟';
      } else if (m.includes('خدمة') || m.includes('travail') || m.includes('work') || m.includes('bureau')) {
        return 'غادية للخدمة؟ لبسي شي حاجة بروفيسيونال ولكن مريحة. قميجة بسيطة مع سروال كلاس ولا كسوة متوسطة. الألوان الهادئة حسن';
      } else if (m.includes('سبور') || m.includes('sport') || m.includes('gym')) {
        return 'غادية للسبور؟ لبسي لباس الرياضة المريح. الليكرا ولا القطن ديال السبور. وما تنسايش السبرديلة!';
      } else if (m.includes('شكرا') || m.includes('merci') || m.includes('thank')) {
        return `بلا جميل أ ${userName || 'لالة'}! أنا هنا ديما باش نعاونك. إلا بغيتي شي حاجة أخرى قولي ليا`;
      }
      return 'فهمتك! إلا بغيتي نقترح عليك طقم كامل ضغطي على طقم اليوم، ولا قولي ليا فين غادية بالضبط ونوجد لك اللبسة المناسبة';
    }

    else if (lang === 'francais') {
      if (m.includes('chaud') || m.includes('hot') || m.includes('سخون') || m.includes('été')) {
        return 'Il fait très chaud? Je te conseille quelque chose de léger. Le lin et le coton sont parfaits pour la chaleur. Tu as une robe courte ou un top sans manches?';
      } else if (m.includes('froid') || m.includes('cold') || m.includes('برد') || m.includes('hiver')) {
        return 'Il fait froid? Mets des couches! Un pull chaud et une veste. N\'oublie pas l\'écharpe. Qu\'est-ce que tu as comme vêtements chauds?';
      } else if (m.includes('mariage') || m.includes('wedding') || m.includes('عرس') || m.includes('fête') || m.includes('party')) {
        return 'Tu as un événement spécial? Il faut que tu sois au top! Pour un mariage, je conseille une robe longue élégante. Pour une sortie, un top chic avec un pantalon et des talons. C\'est quoi l\'occasion exactement?';
      } else if (m.includes('travail') || m.includes('work') || m.includes('خدمة') || m.includes('bureau')) {
        return 'Tu vas au travail? Porte quelque chose de professionnel mais confortable. Une chemise simple avec un pantalon classe ou une robe midi. Les couleurs neutres c\'est mieux';
      } else if (m.includes('sport') || m.includes('gym') || m.includes('سبور')) {
        return 'Tu vas au sport? Mets ta tenue de sport confortable. Legging ou coton de sport. Et n\'oublie pas les baskets!';
      } else if (m.includes('merci') || m.includes('thank') || m.includes('شكرا')) {
        return `De rien ${userName || 'ma belle'}! Je suis toujours là pour t'aider. Si tu veux autre chose dis-moi`;
      }
      return 'Je comprends! Si tu veux que je te propose une tenue complète clique sur Outfit of the Day, ou dis-moi où tu vas exactement et je te trouve la tenue parfaite';
    }

    else {
      if (m.includes('hot') || m.includes('chaud') || m.includes('سخون') || m.includes('summer')) {
        return 'It\'s very hot? I suggest something light. Linen and cotton are perfect for the heat. Do you have a short dress or sleeveless top?';
      } else if (m.includes('cold') || m.includes('froid') || m.includes('برد') || m.includes('winter')) {
        return 'It\'s cold? Layer up! A warm sweater and jacket. Don\'t forget the scarf. What warm clothes do you have?';
      } else if (m.includes('wedding') || m.includes('mariage') || m.includes('عرس') || m.includes('party')) {
        return 'You have a special event? You need to look stunning! For a wedding, I recommend an elegant long dress. For a casual outing, a chic top with nice pants and heels. What\'s the occasion exactly?';
      } else if (m.includes('work') || m.includes('travail') || m.includes('خدمة') || m.includes('office')) {
        return 'Going to work? Wear something professional but comfortable. A simple shirt with classy pants or a midi dress. Neutral colors work best';
      } else if (m.includes('sport') || m.includes('gym') || m.includes('سبور')) {
        return 'Going to the gym? Wear your comfy sportswear. Leggings or cotton sports clothes. And don\'t forget your sneakers!';
      } else if (m.includes('thank') || m.includes('merci') || m.includes('شكرا')) {
        return `You're welcome ${userName || 'darling'}! I'm always here to help. If you need anything else just tell me`;
      }
      return 'I get you! If you want me to suggest a complete outfit click Outfit of the Day, or tell me exactly where you\'re going and I\'ll find you the perfect look';
    }
  };

  const generateOutfit = () => {
    const womenClothes = clothes.filter(item => item.gender === 'Women');
    const tops = womenClothes.filter(item => item.category === 'Tops');
    const bottoms = womenClothes.filter(item => item.category === 'Bottoms');
    const shoes = womenClothes.filter(item => item.category === 'Shoes');
    const dresses = womenClothes.filter(item => item.category === 'Dresses');

    if (tops.length === 0 || (bottoms.length === 0 && dresses.length === 0)) {
      Alert.alert('Not enough items', 'Add some Tops and Bottoms or Dresses first');
      return;
    }

    let outfit = [];
    const useDress = dresses.length > 0 && Math.random() > 0.5;

    if (useDress) {
      outfit.push(dresses[Math.floor(Math.random() * dresses.length)]);
    } else {
      if (tops.length > 0) outfit.push(tops[Math.floor(Math.random() * tops.length)]);
      if (bottoms.length > 0) outfit.push(bottoms[Math.floor(Math.random() * bottoms.length)]);
    }
    if (shoes.length > 0) outfit.push(shoes[Math.floor(Math.random() * shoes.length)]);

    setSuggestedOutfit(outfit);

    const replies = {
      darija: `شوفي هاد الطقم ديال اليوم! ✨ ${outfit.map(i => i.name).join(' و ')}. عجبك؟ إلا بغيتي تبدليه قولي ليا`,
      francais: `Regarde cette tenue du jour! ✨ ${outfit.map(i => i.name).join(' et ')}. Tu aimes? Si tu veux changer dis-moi`,
      english: `Check out today's outfit! ✨ ${outfit.map(i => i.name).join(' and ')}. Do you like it? If you want to change it let me know`
    };

    const fatiReply = {
      id: Date.now(),
      text: replies[language],
      isFati: true
    };
    setMessages([...messages, fatiReply]);
    setCurrentPage('fati');
  };

  const sendMessage = () => {
    if (userMessage === '') return;

    const newUserMsg = { id: Date.now(), text: userMessage, isFati: false };
    const fatiText = getFatiReply(userMessage, language);

    const fatiReply = { id: Date.now() + 1, text: fatiText, isFati: true };
    setMessages([...messages, newUserMsg, fatiReply]);
    setUserMessage('');
  };if (isFirstTime) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeScreen}>
          <Text style={styles.welcomeEmoji}>👗</Text>
          <Text style={styles.welcomeTitle}>مرحبا بك في Style Studio</Text>
          <Text style={styles.welcomeSub}>أنا فاتي، الستايليست ديالك</Text>
          <Text style={styles.label}>شنو سميتك؟</Text>
          <TextInput
            style={styles.input}
            placeholder="كتبي سميتك هنا"
            value={userName}
            onChangeText={setUserName}
          />
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => {
              if (userName === '') {
                Alert.alert('عافاك', 'كتبي سميتك');
                return;
              }
              saveUserName(userName);
            }}
          >
            <Text style={styles.startBtnText}>بداي ✨</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (currentPage === 'home') {
    const totalItems = clothes.length;
    const totalWears = clothes.reduce((sum, item) => sum + item.wears, 0);
    const leastWorn = clothes.length > 0? clothes.reduce((prev, curr) => prev.wears < curr.wears? prev : curr) : null;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.logo}>Style Studio</Text>
            <Text style={styles.greeting}>Good afternoon,</Text>
            <Text style={styles.name}>{userName}</Text>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Your Closet Stats 📊</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{totalItems}</Text>
                <Text style={styles.statLabel}>Items</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{totalWears}</Text>
                <Text style={styles.statLabel}>Total Wears</Text>
              </View>
            </View>
            {leastWorn && (
              <Text style={styles.statsTip}>💡 Tip: "{leastWorn.name}" only worn {leastWorn.wears} times</Text>
            )}
          </View>

          <TouchableOpacity style={styles.outfitBtn} onPress={generateOutfit}>
            <Text style={styles.outfitBtnEmoji}>✨</Text>
            <View>
              <Text style={styles.outfitBtnTitle}>Outfit of the Day</Text>
              <Text style={styles.outfitBtnSub}>Let Fati choose for you</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.cardsContainer}>
            <TouchableOpacity style={styles.card} onPress={() => setCurrentPage('closet')}>
              <Text style={styles.cardEmoji}>👗</Text>
              <Text style={styles.cardTitle}>My Digital Closet</Text>
              <Text style={styles.cardSubtitle}>For Him & Her</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cardFati} onPress={() => setCurrentPage('fati')}>
              <Text style={styles.cardEmoji}>💬</Text>
              <Text style={styles.cardTitleFati}>Ask Fati</Text>
              <Text style={styles.cardSubtitleFati}>Your personal stylist</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentPage === 'closet') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerCloset}>
          <TouchableOpacity style={styles.backButton} onPress={() => { setCurrentPage('home'); setActiveFilter('All'); }}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>My Digital Closet</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setCurrentPage('add')}>
            <Text style={styles.addText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.genderTabs}>
          <TouchableOpacity
            style={[styles.genderTab, gender === 'Women' && styles.genderTabActive]}
            onPress={() => { setGender('Women'); setActiveFilter('All'); }}
          >
            <Text style={[styles.genderText, gender === 'Women' && styles.genderTextActive]}>Women 👗</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderTab, gender === 'Men' && styles.genderTabActive]}
            onPress={() => { setGender('Men'); setActiveFilter('All'); }}
          >
            <Text style={[styles.genderText, gender === 'Men' && styles.genderTextActive]}>Men 👕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
          {categories.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={activeFilter === filter? styles.filterActive : styles.filter}
              onPress={() => setActiveFilter(filter)}
            >
              <Text style={activeFilter === filter? styles.filterTextActive : styles.filterText}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            {filteredClothes.length === 0? (
              <Text style={styles.emptyText}>No items yet. Tap + Add to take photos of your clothes 📸</Text>
            ) : (
              filteredClothes.map((item) => (
                <View key={item.id} style={styles.item}>
                  <TouchableOpacity onLongPress={() => deleteItem(item.id)}>
                    <View style={styles.itemImage}>
                      {item.image? (
                        <Image source={{ uri: item.image }} style={styles.itemPhoto} />
                      ) : (
                        <Text style={styles.emoji}>👕</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemFooter}>
                    <Text style={styles.itemWears}>Worn {item.wears}x</Text>
                    <TouchableOpacity style={styles.wearBtn} onPress={() => wearItem(item.id)}>
                      <Text style={styles.wearBtnText}>+ Wear</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentPage === 'add') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerCloset}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentPage('closet')}>
            <Text style={styles.backText}>← Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add New Item</Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleAddItem}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Photo</Text>
          {newItemImage? (
            <TouchableOpacity onPress={pickImage}>
              <Image source={{ uri: newItemImage }} style={styles.previewImage} />
              <Text style={styles.changePhoto}>Tap to change photo</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                <Text style={styles.photoBtnText}>📸 Take Photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
                <Text style={styles.photoBtnText}>🖼️ Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.label}>Item Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Black Shirt"
            value={newItemName}
            onChangeText={setNewItemName}
          />

          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {addItemCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, newItemCategory === cat && styles.categoryBtnActive]}
                onPress={() => setNewItemCategory(cat)}
              >
                <Text style={[styles.categoryText, newItemCategory === cat && styles.categoryTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>For</Text>
          <View style={styles.genderTabs}>
            <TouchableOpacity
              style={[styles.genderTab, newItemGender === 'Women' && styles.genderTabActive]}
              onPress={() => setNewItemGender('Women')}
            >
              <Text style={[styles.genderText, newItemGender === 'Women' && styles.genderTextActive]}>Women 👗</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderTab, newItemGender === 'Men' && styles.genderTabActive]}
              onPress={() => setNewItemGender('Men')}
            >
              <Text style={[styles.genderText, newItemGender === 'Men' && styles.genderTextActive]}>Men 👕</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentPage === 'fati') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerCloset}>
          <TouchableOpacity style={styles.backButton} onPress={() => setCurrentPage('home')}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Ask Fati 💬</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.languageSelector}>
          <TouchableOpacity
            style={[styles.langBtn, language === 'darija' && styles.langBtnActive]}
            onPress={() => setLanguage('darija')}
          >
            <Text style={[styles.langText, language === 'darija' && styles.langTextActive]}>🇲🇦 دارجة</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, language === 'francais' && styles.langBtnActive]}
            onPress={() => setLanguage('francais')}
          >
            <Text style={[styles.langText, language === 'francais' && styles.langTextActive]}>🇫🇷 Français</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, language === 'english' && styles.langBtnActive]}
            onPress={() => setLanguage('english')}
          >
            <Text style={[styles.langText, language === 'english' && styles.langTextActive]}>🇬🇧 English</Text>
          </TouchableOpacity>
        </View>

        {suggestedOutfit && (
          <View style={styles.outfitSuggestion}>
            <Text style={styles.outfitTitle}>
              {language === 'darija'? 'الطقم ديال اليوم ✨' : language === 'francais'? 'La tenue du jour ✨' : 'Today\'s Outfit ✨'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestedOutfit.map((item) => (
                <View key={item.id} style={styles.outfitItem}>
                  <Image source={{ uri: item.image }} style={styles.outfitImage} />
                  <Text style={styles.outfitItemName}>{item.name}</Text>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.wearOutfitBtn} onPress={() => {
              suggestedOutfit.forEach(item => wearItem(item.id));
              Alert.alert(
                language === 'darija'? 'مزيان!' : language === 'francais'? 'Parfait!' : 'Great!',
                language === 'darija'? 'تلبس بالصحة والراحة 💚' : language === 'francais'? 'Porte-le avec plaisir 💚' : 'Wear it in good health 💚'
              );
              setSuggestedOutfit(null);
            }}>
              <Text style={styles.wearOutfitText}>
                {language === 'darija'? 'لبسي هاد الطقم' : language === 'francais'? 'Porter cette tenue' : 'Wear this outfit'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios'? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <ScrollView style={styles.chatContainer} showsVerticalScrollIndicator={false}>
            {messages.map((msg) => (
              <View key={msg.id} style={[styles.message, msg.isFati? styles.fatiMsg : styles.userMsg]}>
                <Text style={[styles.messageText, msg.isFati? styles.fatiText : styles.userText]}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder={
                language === 'darija'? 'قولي لفاتي فين غادية...' :
                language === 'francais'? 'Dis à Fati où tu vas...' :
                'Tell Fati where you\'re going...'
              }
              value={userMessage}
              onChangeText={setUserMessage}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
              <Text style={styles.sendBtnText}>
                {language === 'darija'? 'صيفطي' : language === 'francais'? 'Envoyer' : 'Send'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F1', paddingHorizontal: 24 },
  header: { marginTop: 60, marginBottom: 20 },
  logo: { fontSize: 16, color: '#B8860B', fontWeight: '600', letterSpacing: 2, marginBottom: 20 },
  greeting: { fontSize: 28, color: '#333', fontWeight: '300' },
  name: { fontSize: 32, color: '#1A1A1A', fontWeight: '700' },
  statsCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  statsTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  stat: { alignItems: 'center' },
  statNumber: { fontSize: 32, fontWeight: '700', color: '#0A4D3C' },
  statLabel: { fontSize: 14, color: '#666', marginTop: 4 },
  statsTip: { fontSize: 13, color: '#B8860B', fontStyle: 'italic', textAlign: 'center', marginTop: 8 },
  outfitBtn: { backgroundColor: '#B8860B', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  outfitBtnEmoji: { fontSize: 40 },
  outfitBtnTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  outfitBtnSub: { fontSize: 14, color: '#FFF8E1', marginTop: 2 },
  cardsContainer: { gap: 20, paddingBottom: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  cardEmoji: { fontSize: 40, marginBottom: 16 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  cardSubtitle: { fontSize: 15, color: '#666', fontWeight: '400' },
  cardFati: { backgroundColor: '#0A4D3C', borderRadius: 24, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  cardTitleFati: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  cardSubtitleFati: { fontSize: 15, color: '#D1E7E0', fontWeight: '400' },
  headerCloset: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, paddingBottom: 16, marginHorizontal: -24, paddingHorizontal: 24 },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: '#0A4D3C', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  addButton: { backgroundColor: '#0A4D3C', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  saveButton: { backgroundColor: '#B8860B', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  saveText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  genderTabs: { flexDirection: 'row', marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 4 },
  genderTab: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  genderTabActive: { backgroundColor: '#0A4D3C' },
  genderText: { fontSize: 15, fontWeight: '600', color: '#666' },
  genderTextActive: { color: '#FFFFFF' },
  filters: { marginLeft: -24, paddingLeft: 24, marginBottom: 20, maxHeight: 50 },
  filterActive: { backgroundColor: '#0A4D3C', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 12 },
  filter: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 12 },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  filterText: { color: '#666', fontWeight: '500', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8, justifyContent: 'space-between' },
emptyText: { textAlign: 'center', color: '#666', fontSize: 16, marginTop: 60, paddingHorizontal: 20 },
  item: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 16, marginHorizontal: '1%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  itemImage: { backgroundColor: '#F9F6F1', borderRadius: 12, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  itemPhoto: { width: '100%', height: '100%', resizeMode: 'cover' },
  emoji: { fontSize: 50 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  itemWears: { fontSize: 12, color: '#B8860B', fontWeight: '500' },
  wearBtn: { backgroundColor: '#0A4D3C', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  wearBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  label: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginTop: 24, marginBottom: 12 },
  input: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0' },
  photoButtons: { gap: 12 },
  photoBtn: { backgroundColor: '#0A4D3C', padding: 20, borderRadius: 12, alignItems: 'center' },
  photoBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  previewImage: { width: '100%', height: 300, borderRadius: 12, resizeMode: 'cover' },
  changePhoto: { textAlign: 'center', color: '#0A4D3C', marginTop: 8, fontWeight: '600' },
  categoryScroll: { marginLeft: -24, paddingLeft: 24 },
  categoryBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  categoryBtnActive: { backgroundColor: '#0A4D3C', borderColor: '#0A4D3C' },
  categoryText: { color: '#666', fontWeight: '600', fontSize: 14 },
  categoryTextActive: { color: '#FFFFFF' },
  outfitSuggestion: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16 },
  outfitTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  outfitItem: { marginRight: 12, alignItems: 'center' },
  outfitImage: { width: 80, height: 80, borderRadius: 12, resizeMode: 'cover' },
  outfitItemName: { fontSize: 12, color: '#666', marginTop: 4, maxWidth: 80, textAlign: 'center' },
  wearOutfitBtn: { backgroundColor: '#0A4D3C', padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  wearOutfitText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  chatContainer: { flex: 1, marginBottom: 8 },
  message: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  fatiMsg: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userMsg: { backgroundColor: '#0A4D3C', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 20 },
  fatiText: { color: '#1A1A1A' },
  userText: { color: '#FFFFFF' },
  inputContainer: { flexDirection: 'row', gap: 8, paddingBottom: 8 },
  chatInput: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 20, paddingVertical: 12, fontSize: 15 },
  sendBtn: { backgroundColor: '#B8860B', paddingHorizontal: 24, borderRadius: 24, justifyContent: 'center' },
  sendBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  languageSelector: { flexDirection: 'row', gap: 8, marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 8 },
  langBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
  langBtnActive: { backgroundColor: '#0A4D3C', borderColor: '#0A4D3C' },
  langText: { fontSize: 14, fontWeight: '600', color: '#666' },
  langTextActive: { color: '#FFFFFF' },
  welcomeScreen: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  welcomeEmoji: { fontSize: 80, textAlign: 'center', marginBottom: 20 },
  welcomeTitle: { fontSize: 28, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 8 },
  welcomeSub: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  startBtn: { backgroundColor: '#B8860B', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  startBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});