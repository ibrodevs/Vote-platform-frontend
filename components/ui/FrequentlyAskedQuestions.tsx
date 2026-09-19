'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { Language } from '@/lib/i18n';
import { Badge } from '@/components/ui/Badge';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FrequentlyAskedQuestionsProps {
  lang?: Language;
  title?: string;
  description?: string;
  data?: FAQItem[];
  className?: string;
  supportEmail?: string;
}

const FAQS_RU: FAQItem[] = [
  {
    question: 'Как обеспечивается тайна моего голосования?',
    answer:
      'Платформа Dobush.kg физически и криптографически разделяет данные об авторизации избирателя и заполненный бюллетень. В системе фиксируется только факт выдачи бюллетеня (для исключения повторного голосования), а сам голос сохраняется анонимно без привязки к вашему студенческому билету или номеру телефона.',
  },
  {
    question: 'Как пройти авторизацию для участия в выборах?',
    answer:
      'Авторизация проходит через ввод номера студенческого билета (или логина вуза) и номера телефона, привязанного к деканату. На телефон приходит одноразовый 6-значный SMS-код для подтверждения личности. После этого открывается доступ к активным бюллетеням вашего университета.',
  },
  {
    question: 'Что делать, если мне не приходит SMS-код?',
    answer:
      'Убедитесь, что номер телефона введен корректно и совпадает с данными в базе деканата вашего вуза. Если код не поступил в течение 60 секунд, вы можете запросить повторную отправку или обратиться к администратору избирательной комиссии вашего университета.',
  },
  {
    question: 'Могу ли я изменить свой выбор после отправки бюллетеня?',
    answer:
      'Нет. В соответствии с регламентом тайного голосования, после подтверждения выбора бюллетень окончательно запечатывается и отправляется в электронную урну. Изменить или отозвать отправленный голос невозможно.',
  },
  {
    question: 'Как выдвинуть свою кандидатуру на студенческих выборах?',
    answer:
      'Регистрация кандидатов осуществляется через избирательную комиссию вашего университета в установленные сроки избирательной кампании. Комиссия вносит кандидата в реестр, после чего на платформе публикуется предвыборная программа, биография и фото кандидата.',
  },
  {
    question: 'Как избиратели могут проверить честность подсчёта голосов?',
    answer:
      'По завершении выборов в системе автоматически генерируется и публикуется электронный протокол с контрольными суммами и детализацией по явке. Наблюдатели и студенты могут в режиме реального времени отслеживать процент явки, а после закрытия участков ознакомиться с официальными результатами.',
  },
];

const FAQS_KY: FAQItem[] = [
  {
    question: 'Менин добушумдун купуялуулугу кантип камсыздалат?',
    answer:
      'Dobush.kg платформасы шайлоочунун маалыматтарын жана толтурулган бюллетенди физикалык жана криптографиялык жактан бөлөт. Системде кайра добуш берүүнү болтурбоо үчүн бюллетень берилгендиги гана катталат, ал эми тандоо эч кандай жеке маалыматка байланбай сакталат.',
  },
  {
    question: 'Шайлоого катышуу үчүн кантип кирүү керек?',
    answer:
      'Кирүү студенттик билеттин номери (же ЖОЖдун логини) жана деканатта катталган телефон номери аркылуу жүргүзүлөт. Инсандыкты тастыктоо үчүн бир жолку 6 орундуу SMS-код келет. Андан кийин ЖОЖуңуздун активдүү шайлоолору ачылат.',
  },
  {
    question: 'SMS-код келбей жатса эмне кылуу керек?',
    answer:
      'Телефон номериңиз деканаттын базасындагы номерге дал келерин текшериңиз. Эгерде код 60 секунд ичинде келбесе, кайра жөнөтүүнү сурасаңыз болот же университетиңиздин шайлоо комиссиясына кайрылыңыз.',
  },
  {
    question: 'Бюллетенди жөнөткөндөн кийин тандоомду өзгөртө аламбы?',
    answer:
      'Жок. Жашыруун добуш берүү эрежелерине ылайык, тандоо тастыкталгандан кийин бюллетень электрондук урнага түшөт. Жөнөтүлгөн добушту өзгөртүү же артка кайтаруу мүмкүн эмес.',
  },
  {
    question: 'Студенттик шайлоого талапкер катары кантип катталууга болот?',
    answer:
      'Талапкерлерди каттоо шайлоо өнөктүгүнүн белгиленген мөөнөтүндө университетиңиздин шайлоо комиссиясы аркылуу жүргүзүлөт. Комиссия талапкерди реестрге киргизгенден кийин программа жана маалымат платформага жайгаштырылат.',
  },
  {
    question: 'Добуштарды саноонун тазалыгын кантип текшерүүгө болот?',
    answer:
      'Шайлоо аяктагандан кийин системде автоматтык түрдө расмий электрондук протокол түзүлөт. Байкоочулар жана студенттер реалдуу убакыт режиминде шайлоого катышуу пайызын жана жыйынтыктарды көрө алышат.',
  },
];

import { api } from '@/lib/api';

export default function FrequentlyAskedQuestions({
  lang = 'ru',
  title,
  description,
  data,
  className,
  supportEmail = 'support@dobush.kg',
}: FrequentlyAskedQuestionsProps) {
  const [apiFaqs, setApiFaqs] = useState<any[] | null>(null);

  useEffect(() => {
    let isMounted = true;
    api.getFaqs()
      .then((res) => {
        const list = Array.isArray(res) ? res : ((res as any)?.results || []);
        if (isMounted && list.length > 0) {
          setApiFaqs(list);
        }
      })
      .catch((err) => {
        console.warn('Could not load FAQs from API, using fallback:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const currentTitle =
    title || (lang === 'ru' ? 'Часто задаваемые вопросы' : 'Көп берилүүчү суроолор');
  const currentDescription =
    description ||
    (lang === 'ru'
      ? 'Ответы на ключевые вопросы о безопасности, авторизации и процедуре студенческого голосования. Если вы не нашли ответ, напишите нам:'
      : 'Коопсуздук, кирүү жана студенттик добуш берүү процедурасы боюнча негизги суроолорго жооптор. Эгер жооп таппасаңыз, бизге жазыңыз:');

  const defaultData = lang === 'ky' ? FAQS_KY : FAQS_RU;

  const currentData = data || (apiFaqs ? apiFaqs.map((item: any) => ({
    question: (lang === 'ky' && item.question_ky) ? item.question_ky : item.question,
    answer: (lang === 'ky' && item.answer_ky) ? item.answer_ky : item.answer,
  })) : defaultData);

  const words = currentTitle.split(' ');

  return (
    <section className={cn('relative w-full overflow-hidden py-20 md:py-28 bg-[var(--bg)] border-b border-[var(--line)] transition-colors duration-500', className)}>
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="text-center mb-4">
          <Badge variant="blue" className="mb-3">
            {lang === 'ru' ? 'FAQ & ПОДДЕРЖКА' : 'FAQ ЖАНА КОЛДОО'}
          </Badge>
        </div>

        <h2 className="relative z-10 mx-auto max-w-4xl text-center text-3xl font-bold tracking-tight text-[var(--ink)] md:text-5xl lg:text-5xl">
          {words.map((word, index) => (
            <motion.span
              key={`${word}-${index}`}
              initial={{ opacity: 0, filter: 'blur(6px)', y: 12 }}
              whileInView={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: index * 0.08,
                ease: 'easeInOut',
              }}
              className="mr-2 inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative z-10 mx-auto mt-5 max-w-2xl text-center text-sm md:text-base text-[var(--muted)] leading-relaxed"
        >
          {currentDescription}{' '}
          <a
            href={`mailto:${supportEmail}`}
            className="text-[var(--blue)] font-medium underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            {supportEmail}
          </a>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 sm:p-8 shadow-sm"
        >
          <Accordion type="single" collapsible className="w-full">
            {currentData.map((item: any, index: number) => (
              <motion.div
                key={`faq-${index}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.35,
                  delay: 0.2 + index * 0.05,
                  ease: 'easeOut',
                }}
              >
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

export { FrequentlyAskedQuestions };
